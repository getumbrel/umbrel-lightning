const {test: runTest, before, after} = require('node:test');
const test = (name, fn) => runTest(name, {timeout: 15000}, fn);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const backend = path.resolve(__dirname, '../apps/backend');
require('module-alias').addPath(backend);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lightning-transport-'));
let server, lnd;
let expectedMacaroon = Buffer.from('synthetic-macaroon');
let lastRequest, paymentMode = 'success', infoError;
const options = {keepCase:true, longs:String, enums:String, defaults:true, oneofs:true};
const load = name => grpc.loadPackageDefinition(protoLoader.loadSync(path.join(backend, 'resources', name+'.proto'), options));
const proto = Object.assign({}, ...['rpc','routerrpc','watchtowerrpc','wtclientrpc'].map(load));
function unary(response, authenticate=true) {
  return (call, callback) => {
    try {
      assert.deepEqual(call.metadata.get('macaroon'), authenticate ? [expectedMacaroon.toString('hex')] : []);
      lastRequest=call.request;
      callback(null, typeof response==='function' ? response(call.request) : response);
    } catch(error) {callback(error);}
  };
}
before(async () => {
  let certDir=process.env.TEST_TLS_DIR;
  if (!certDir) {
    certDir=dir;
    execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-sha256','-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1','-keyout',path.join(dir,'key.pem'),'-out',path.join(dir,'cert.pem')],{stdio:'ignore'});
  }
  fs.copyFileSync(path.join(certDir,'cert.pem'),path.join(dir,'tls.cert'));
  fs.writeFileSync(path.join(dir,'admin.macaroon'),expectedMacaroon);
  server=new grpc.Server();
  server.addService(proto.lnrpc.Lightning.service, {
    getInfo(call, callback) {if(infoError) return callback(infoError); unary({identity_pubkey:'test-node',block_height:42,synced_to_chain:true})(call,callback);},
    listChannels:unary({channels:[{chan_id:'9007199254740993',local_balance:'1234',remote_balance:'5678',active:true}]}),
    channelBalance:unary({balance:'1234'}),
    estimateFee:unary({fee_sat:'123',feerate_sat_per_byte:'2'}),
    addInvoice:unary({r_hash:Buffer.from([0,1,128,255]),payment_request:'synthetic-invoice'}),
    restoreChannelBackups:unary({}),
    closeChannel(call) {lastRequest=call.request; call.write({close_pending:{txid:Buffer.from([1,2,3]),output_index:1}});call.end();},
  });
  server.addService(proto.lnrpc.WalletUnlocker.service, {
    genSeed:unary({cipher_seed_mnemonic:['synthetic-seed']},false),
    initWallet:unary({},false),
    unlockWallet:unary({},false),
  });
  server.addService(proto.routerrpc.Router.service, {sendPaymentV2(call) {
    lastRequest=call.request;
    assert.deepEqual(call.metadata.get('macaroon'),[expectedMacaroon.toString('hex')]);
    if(paymentMode==='rpc-error') return call.emit('error', {code:grpc.status.UNAVAILABLE,details:'synthetic transport failure'});
    if(paymentMode==='empty') return call.end();
    call.write({status:'IN_FLIGHT'});
    call.write(paymentMode==='failed' ? {status:'FAILED',failure_reason:'FAILURE_REASON_NO_ROUTE'} : {status:'SUCCEEDED',payment_hash:'synthetic-hash',value_sat:'2000',fee_sat:'1'});
    call.end();
  }});
  server.addService(proto.watchtowerrpc.Watchtower.service,{getInfo:unary({pubkey:Buffer.from([1,2,3]),listeners:['localhost:9911'],uris:[]})});
  server.addService(proto.wtclientrpc.WatchtowerClient.service,{listTowers:unary({towers:[]}),addTower:unary({})});
  const credentials=grpc.ServerCredentials.createSsl(null,[{private_key:fs.readFileSync(path.join(certDir,'key.pem')),cert_chain:fs.readFileSync(path.join(certDir,'cert.pem'))}]);
  const port=await new Promise((resolve,reject)=>server.bindAsync('127.0.0.1:0',credentials,(e,p)=>e?reject(e):resolve(p)));
  Object.assign(process.env,{LND_HOST:'127.0.0.1',LND_PORT:String(port),TLS_FILE:path.join(dir,'tls.cert'),MACAROON_DIR:dir+'/',PROTO_FILE:path.join(backend,'resources/rpc.proto'),ROUTERRPC_PROTO_FILE:path.join(backend,'resources/routerrpc.proto'),WATCHTOWERRPC_PROTO_FILE:path.join(backend,'resources/watchtowerrpc.proto'),WTCLIENTRPC_PROTO_FILE:path.join(backend,'resources/wtclientrpc.proto')});
  lnd=require('../apps/backend/services/lnd');
});
after(()=>{server?.forceShutdown();fs.rmSync(dir,{recursive:true,force:true});});
test('TLS and macaroon authentication preserve dashboard response fields',async()=>{
  const info=await lnd.getInfo();assert.equal(info.identityPubkey,'test-node');assert.equal(info.blockHeight,42);assert.equal(info.syncedToChain,true);assert.deepEqual(info.uris,[]);
});
test('64-bit channel identifiers and balances retain exact string values',async()=>{
  const channels=await lnd.getOpenChannels();assert.equal(channels[0].chanId,'9007199254740993');assert.equal(channels[0].localBalance,'1234');assert.equal((await lnd.getChannelBalance()).balance,'1234');
});
test('mixed-case maps and underscored request fields reach LND unchanged',async()=>{
  assert.equal((await lnd.estimateFee('synthetic-address',12345,6)).feeSat,'123');assert.equal(lastRequest.AddrToAmount['synthetic-address'],'12345');assert.equal(lastRequest.target_conf,6);
});
test('invoice hashes and channel backups retain their bytes',async()=>{
  const invoice=await lnd.addInvoice(1234,'test');assert.deepEqual(Object.values(invoice.rHash),[0,1,128,255]);assert.equal(invoice.paymentRequest,'synthetic-invoice');
  await lnd.recoverBackup(Buffer.from([0,1,128,255]));assert.deepEqual(lastRequest.multi_chan_backup,Buffer.from([0,1,128,255]));assert.equal(lastRequest.backup,'multi_chan_backup');
});
test('channel-close streams retain the oneof discriminator',async()=>{
  await lnd.closeChannel('01'.repeat(32),1,false);assert.equal(lastRequest.channel_point.funding_txid,'funding_txid_str');assert.equal(lastRequest.channel_point.funding_txid_str,'01'.repeat(32));
});
test('payment streams ignore interim states and resolve final success',async()=>{
  paymentMode='success';const p=await lnd.sendPayment('synthetic-invoice',undefined,2000);assert.equal(p.status,'SUCCEEDED');assert.equal(p.paymentHash,'synthetic-hash');assert.equal(lastRequest.fee_limit_sat,'100');assert.equal(lastRequest.no_inflight_updates,true);
});
test('amountless invoices preserve explicit amount and small-payment fee limit',async()=>{
  await lnd.sendPayment('synthetic-invoice',250,250);assert.equal(lastRequest.amt,'250');assert.equal(lastRequest.fee_limit_sat,'250');
});
test('failed payments preserve the named failure reason',async()=>{
  paymentMode='failed';await assert.rejects(lnd.sendPayment('synthetic-invoice',undefined,2000),/no route found/);
});
test('payment transport errors retain gRPC status and details',async()=>{
  paymentMode='rpc-error';await assert.rejects(lnd.sendPayment('synthetic-invoice',undefined,2000),e=>e.error.code===grpc.status.UNAVAILABLE && e.error.details==='synthetic transport failure');
});
test('payment streams ending without a final state remain errors',async()=>{
  paymentMode='empty';await assert.rejects(lnd.sendPayment('synthetic-invoice',undefined,2000),/no final payment status/);
});
test('wallet and non-wallet gRPC errors preserve exact status and details',async()=>{
  for(const details of ['wallet locked, unlock it to enable full RPC access','wallet not created, create one to enable full RPC access','unrelated transport failure']) {
    infoError={code:grpc.status.UNIMPLEMENTED,details};await assert.rejects(lnd.getInfo(),e=>e.error.code===12 && e.error.details===details);
  }
  infoError=undefined;
});
test('watchtower services retain binary keys and empty list responses',async()=>{
  assert.deepEqual(Object.values((await lnd.getWatchtowerServiceInfo()).pubkey),[1,2,3]);assert.deepEqual((await lnd.listWatchtowers()).towers,[]);await lnd.addWatchtower('010203@localhost:9911');assert.deepEqual(lastRequest.pubkey,Buffer.from([1,2,3]));assert.equal(lastRequest.address,'localhost:9911');
});
test('subsequent calls read a rotated macaroon from disk',async()=>{
  expectedMacaroon=Buffer.from('rotated-synthetic-macaroon');fs.writeFileSync(path.join(dir,'admin.macaroon'),expectedMacaroon);await lnd.getInfo();
});
test('wallet creation and unlock work with TLS before a macaroon exists',async()=>{
  fs.unlinkSync(path.join(dir,'admin.macaroon'));assert.deepEqual((await lnd.generateSeed()).cipherSeedMnemonic,['synthetic-seed']);
  assert.deepEqual(await lnd.initWallet({password:'synthetic-password',mnemonic:['synthetic-seed']}),['synthetic-seed']);assert.deepEqual(lastRequest.wallet_password,Buffer.from('synthetic-password'));assert.equal(lastRequest.recovery_window,250);
  await lnd.unlockWallet('synthetic-password');assert.deepEqual(lastRequest.wallet_password,Buffer.from('synthetic-password'));
});
