const {promisify} = require('util');
const crypto = require('crypto');
const { unzip, gzip } = require('zlib');
const { Readable } = require('stream');

const openpgp = require('openpgp');
const { CipherSeed } = require('aezeed');
const { SocksProxyAgent } = require("socks-proxy-agent");
const axios = require("axios");
const tar = require('tar-stream');
const getStream = require('get-stream');
const FormData = require('form-data');

const constants = require("utils/const.js");

const BACKUP_MAX_TIMESTAMPS = 300;

let agent;
if (constants.TOR_PROXY_IP && constants.TOR_PROXY_PORT) {
  agent = new SocksProxyAgent(`socks5h://${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`);
}

const deriveLegacyUmbrelSeed = mnemonic => {
  const {entropy} = CipherSeed.fromMnemonic(mnemonic);
  const umbrelSeed = crypto
    .createHmac('sha256', entropy)
    .update('umbrel-seed')
    .digest('hex');
  return umbrelSeed;
};

const deriveEntropy = (seed, indentifier, options) => {
  if (options && options.legacy) {
    seed = deriveLegacyUmbrelSeed(seed);
  }

  return crypto
    .createHmac('sha256', seed)
    .update(indentifier)
    .digest('hex');
};

const getBackupsFromBackupId = async backupId => {
  try {
    const response = await axios({
      url: `https://api.umbrel.com/lightning-backups/${backupId}`,
      httpsAgent: agent,
      method: 'GET',
    });

    return response.data.timestamps;
  } catch {
    return [];
  }
};

const listBackups = async mnemonic => {
  const backupId = deriveEntropy(mnemonic, 'umbrel_backup_id', {legacy: false});
  const legacyBackupId = deriveEntropy(mnemonic, 'umbrel_backup_id', {legacy: true});

  const timeStamps = (await Promise.all([
    getBackupsFromBackupId(backupId),
    getBackupsFromBackupId(legacyBackupId),
  ])).flat();

  return timeStamps.sort((a, b) => b - a).slice(0, BACKUP_MAX_TIMESTAMPS);
};

const grabFileFromTar = async (tarBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const untar = tar.extract();
    let fileStream;
    untar.on('entry', (header, stream, callback) => {
      if (header.name === filename) {
        fileStream = stream;
      }
      callback();
    });
    untar.on('finish', () => resolve(getStream.buffer(fileStream)));
    untar.on('error', reject);
    Readable.from(tarBuffer).pipe(untar);
  });
}

const decryptBackup = async (encryptionKey, backup) => {
  const message = await openpgp.readMessage({binaryMessage: backup});
  const {data} = await openpgp.decrypt({
    message,
    passwords: [encryptionKey],
    format: 'binary'
  });

  const tarFile = await promisify(unzip)(data)
  const channelBackup = grabFileFromTar(tarFile, 'backup/channel.backup');

  return channelBackup;
}

const getBackup = async (mnemonic, timestamp, options) => {
  const backupId = deriveEntropy(mnemonic, 'umbrel_backup_id', options);
  const response = await axios({
    url: `https://api.umbrel.com/lightning-backups/${backupId}/${timestamp}`,
    httpsAgent: agent,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  const encryptionKey = deriveEntropy(mnemonic, 'umbrel_backup_encryption_key', options);
  return decryptBackup(encryptionKey, response.data);
};

const getBackupFromTimestamp = async (mnemonic, timestamp) => {
  const results = await Promise.all([
    getBackup(mnemonic, timestamp, {legacy: false}).catch(() => {}),
    getBackup(mnemonic, timestamp, {legacy: true}).catch(() => {}),
  ]);
  const backup = results.filter(item => typeof item !== 'undefined')[0];

  if (!backup) {
    throw new Error('Backup unavailable');
  }

  return backup;
};

const uploadBackup = async (mnemonic, backup) => {
  const pack = tar.pack();
  pack.entry({ name: 'backup/channel.backup' }, backup);
  // Add ~6.5kb of random padding
  const paddingLength = Math.floor(crypto.randomBytes(2).readUIntBE(0, 2) / 10); // 0-6553
  const paddingBuffer = crypto.randomBytes(paddingLength);
  pack.entry({ name: 'backup/.padding' }, paddingBuffer);
  pack.finalize();
  const tarBuffer = await getStream.buffer(pack);
  const tarball = await promisify(gzip)(tarBuffer);

  const encryptionKey = deriveEntropy(mnemonic, 'umbrel_backup_encryption_key');
  const message = await openpgp.createMessage({binary: tarball});
  const encryptedTarball = await openpgp.encrypt({
      message,
      passwords: [encryptionKey],
      format: 'binary',
  });

  const backupId = deriveEntropy(mnemonic, 'umbrel_backup_id');
  const form = new FormData();
  form.append('file', Buffer.from(encryptedTarball));
  const response = await axios({
    url: `https://pvf3ozmmfl.execute-api.us-east-1.amazonaws.com/prod/v1/upload/${backupId}`,
    httpsAgent: agent,
    method: 'POST',
    data: form.getBuffer(),
    headers: form.getHeaders(),
  });

  return response;
};

module.exports = {
  listBackups,
  getBackupFromTimestamp,
  uploadBackup,
};