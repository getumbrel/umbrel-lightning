const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const https = require('node:https');
const net = require('node:net');
const tls = require('node:tls');
const {execFileSync} = require('node:child_process');
const axios = require('axios');
const express = require('express');
const fixture = require('./fixtures/backup-v1.3.2.json');

require('module-alias').addPath(path.resolve(__dirname, '../apps/backend'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lightning-http-'));
const sockets = new Set();
const proxyRequests = [];
let upstream, proxy, app, backups, cert, interceptor;
let stored = Buffer.from(fixture.encrypted, 'base64');
let priceAvailable = true;
const originalCAs = tls.getCACertificates('default');

async function listen(server) {
  server.on('connection', socket => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server.address().port;
}

// A local SOCKS5 fixture. It only permits connections to our HTTPS server.
function proxyConnection(socket) {
  let buffer = Buffer.alloc(0);
  let greeting = true;
  const read = chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    if (greeting) {
      if (buffer.length < 2 || buffer.length < 2 + buffer[1]) return;
      if (buffer[0] !== 5) return socket.destroy();
      buffer = buffer.subarray(2 + buffer[1]);
      socket.write(Buffer.from([5, 0]));
      greeting = false;
    }
    if (buffer.length < 5) return;
    if (buffer[0] !== 5 || buffer[1] !== 1 || buffer[3] !== 3) return socket.destroy();
    const size = 5 + buffer[4] + 2;
    if (buffer.length < size) return;
    const host = buffer.subarray(5, size - 2).toString();
    const port = buffer.readUInt16BE(size - 2);
    if (host !== 'localhost' || port !== upstream.address().port) return socket.destroy();
    proxyRequests.push({host, port});
    socket.removeListener('data', read);
    const target = net.connect(port, '127.0.0.1', () => {
      socket.write(Buffer.from([5, 0, 0, 1, 127, 0, 0, 1, 0, 0]));
      target.write(buffer.subarray(size));
      socket.pipe(target).pipe(socket);
    });
    target.on('error', () => socket.destroy());
    socket.on('error', () => target.destroy());
    socket.on('close', () => target.destroy());
  };
  socket.on('data', read);
}

before(async () => {
  let certDir = process.env.TEST_TLS_DIR;
  if (!certDir) {
    certDir = dir;
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1', '-keyout', path.join(dir, 'key.pem'), '-out', path.join(dir, 'cert.pem')], {stdio: 'ignore'});
  }
  cert = fs.readFileSync(path.join(certDir, 'cert.pem'), 'utf8');
  tls.setDefaultCACertificates([...originalCAs, cert]);
  upstream = https.createServer({cert, key: fs.readFileSync(path.join(certDir, 'key.pem'))}, async (req, res) => {
    try {
      if (req.url === '/api/v1/prices') {
        res.writeHead(priceAvailable ? 200 : 503, {'content-type': 'application/json'});
        return res.end(JSON.stringify({USD: 12345, AUD: 23456}));
      }
      if (!req.url.includes(fixture.backupId)) {
        res.writeHead(404);
        return res.end();
      }
      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        const start = body.indexOf('\r\n\r\n') + 4;
        const end = body.lastIndexOf('\r\n--' + boundary);
        assert(start > 3 && end > start);
        assert.match(body.subarray(0, start).toString(), /name="file"/);
        stored = body.subarray(start, end);
        res.setHeader('content-type', 'application/json');
        return res.end(JSON.stringify({ok: true}));
      }
      if (req.url.endsWith(fixture.backupId)) {
        res.setHeader('content-type', 'application/json');
        return res.end(JSON.stringify({timestamps: [1234, 2345]}));
      }
      res.setHeader('content-type', 'application/octet-stream');
      res.end(stored);
    } catch (error) {
      res.writeHead(500);
      res.end(error.message);
    }
  });
  const httpsPort = await listen(upstream);
  proxy = net.createServer(proxyConnection);
  const proxyPort = await listen(proxy);
  Object.assign(process.env, {
    JSON_STORE_FILE: path.join(dir, 'state.json'),
    TOR_PROXY_IP: '127.0.0.1',
    TOR_PROXY_PORT: String(proxyPort),
  });
  // Redirect only the destination, preserving real Axios, TLS, multipart and
  // SOCKS transports. No requests can reach the production services.
  interceptor = axios.interceptors.request.use(config => {
    const url = new URL(config.url);
    assert(['api.umbrel.com', 'pvf3ozmmfl.execute-api.us-east-1.amazonaws.com', 'mempool.space'].includes(url.hostname));
    config.url = `https://localhost:${httpsPort}${url.pathname}`;
    config.proxy = false;
    config.timeout = 3000;
    return config;
  });
  backups = require('../apps/backend/utils/backups');
  const server = express();
  server.use(require('../apps/backend/middlewares/requestCorrelationId'));
  server.use('/external', require('../apps/backend/routes/v1/external'));
  app = require('node:http').createServer(server);
  await listen(app);
});

after(async () => {
  axios.interceptors.request.eject(interceptor);
  tls.setDefaultCACertificates(originalCAs);
  for (const socket of sockets) socket.destroy();
  await Promise.all([app, proxy, upstream].filter(Boolean).map(server => new Promise(resolve => server.close(resolve))));
  fs.rmSync(dir, {recursive: true, force: true});
});

for (const tor of [false, true]) {
  test(`backup listing, multipart upload and binary restore over ${tor ? 'SOCKS5' : 'direct HTTPS'}`, {timeout: 15000}, async () => {
    fs.writeFileSync(process.env.JSON_STORE_FILE, JSON.stringify({backupOverTor: tor}));
    const before = proxyRequests.length;
    assert.deepEqual(await backups.listBackups(fixture.mnemonic), [2345, 1234]);
    const bytes = Buffer.from(`Synthetic backup over ${tor ? 'SOCKS5' : 'HTTPS'}; no wallet data.`);
    assert.deepEqual((await backups.uploadBackup(fixture.mnemonic, bytes)).data, {ok: true});
    assert.deepEqual(await backups.getBackupFromTimestamp(fixture.mnemonic, 2345), bytes);
    assert(tor ? proxyRequests.length >= before + 5 : proxyRequests.length === before);
  });
}

test('price requests retain currency selection and unavailable-service responses over SOCKS5', {timeout: 15000}, async () => {
  const base = `http://127.0.0.1:${app.address().port}/external/price`;
  const before = proxyRequests.length;
  assert.deepEqual(await (await fetch(base)).json(), {USD: 12345});
  assert.deepEqual(await (await fetch(base + '?currency=aud')).json(), {AUD: 23456});
  assert.equal((await fetch(base + '?currency=UNKNOWN')).status, 502);
  priceAvailable = false;
  assert.equal((await fetch(base)).status, 502);
  assert.equal(proxyRequests.length, before + 4);
});

test('wallet connection links retain local/Tor hosts, certificate and macaroon bytes', () => {
  const {encode, decode} = require('lndconnect');
  const macaroon = Buffer.from([0, 1, 128, 255]);
  for (const host of ['umbrel.local:8080', 'umbrel.local:10009', 'synthetic.onion:8080', 'synthetic.onion:10009']) {
    const url = encode({host, cert, macaroon});
    const encodedCert = cert.split('\n').filter(line => line && !line.startsWith('-----')).join('');
    assert.equal(url, `lndconnect://${host}?cert=${Buffer.from(encodedCert, 'base64').toString('base64url')}&macaroon=${macaroon.toString('base64url')}`);
    const decoded = decode(url);
    assert.equal(decoded.host, host);
    assert.equal(decoded.cert.trim(), cert.trim());
    assert.equal(decoded.macaroon, macaroon.toString('hex'));
  }
});
