const {test, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const backend = path.resolve(__dirname, '../apps/backend');
require('module-alias').addPath(backend);
const fixture = require('./fixtures/backup-v1.3.2.json');
const dir = fs.mkdtempSync(path.join(os.tmpdir(),'lightning-backup-'));
process.env.JSON_STORE_FILE=path.join(dir,'state.json');
fs.writeFileSync(process.env.JSON_STORE_FILE,JSON.stringify({backupOverTor:false}));
const axiosPath=require.resolve('axios');
require('axios');
let stored=Buffer.from(fixture.encrypted,'base64');
let storedId=fixture.backupId;
// Stub only HTTP transport; exercise the application's real encryption, archive
// and key-derivation code using synthetic data from the shipped image.
require.cache[axiosPath].exports=async config=>{
  if(config.method==='POST') {
    storedId=config.url.split('/').at(-1);
    const boundary=config.headers['content-type'].split('boundary=')[1];
    const start=config.data.indexOf('\r\n\r\n')+4;
    const end=config.data.lastIndexOf('\r\n--'+boundary);
    assert(start>3 && end>start);
    stored=config.data.subarray(start,end);
    return {data:{ok:true}};
  }
  if(!config.url.includes(storedId)) throw new Error('Synthetic backup not found');
  return {data:stored};
};
const backups=require('../apps/backend/utils/backups');
after(()=>fs.rmSync(dir,{recursive:true,force:true}));
test('deterministic seed derivation matches the shipped runtime',()=>{
  assert.equal(require('../apps/backend/utils/deterministic-aezeed')('synthetic-runtime-test-fixture'),fixture.mnemonic);
});
test('backups from the shipped image restore on the new runtime',async()=>{
  assert.equal((await backups.getBackupFromTimestamp(fixture.mnemonic,1234)).toString('base64'),fixture.backup);
});
test('new backups preserve the backup identifier and restore original bytes',async()=>{
  const bytes=Buffer.from('Another synthetic backup, containing no wallet data.');
  await backups.uploadBackup(fixture.mnemonic,bytes);
  assert.equal(storedId,fixture.backupId);
  assert.deepEqual(await backups.getBackupFromTimestamp(fixture.mnemonic,1234),bytes);
});
test('corrupt backup content remains a restoration error',async()=>{
  stored=Buffer.from('not an encrypted backup');
  await assert.rejects(backups.getBackupFromTimestamp(fixture.mnemonic,1234),/Backup unavailable/);
});
