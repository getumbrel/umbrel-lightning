const constants = require("utils/const.js");
const diskService = require("services/disk");

function readBackupStatusFile() {
  return diskService.readJsonFile(constants.BACKUP_STATUS_FILE);
}

function readTermsAcknowledgeFile() {
  return diskService.readJsonFile(constants.TERMS_ACKNOWLEDGE_FILE);
}

function readManagedChannelsFile() {
  return diskService
    .readJsonFile(constants.MANAGED_CHANNELS_FILE)
    .catch(() => Promise.resolve({}));
}

function writeManagedChannelsFile(data) {
  return diskService.writeJsonFile(constants.MANAGED_CHANNELS_FILE, data);
}

function writeTermsAcknowledgeFile() {
  return diskService.writeJsonFile(constants.TERMS_ACKNOWLEDGE_FILE, {
    accepted: true
  });
}

async function writeUserFile(json) {
  return diskService.writeJsonFile(constants.USER_FILE, json);
}

async function readUserFile() {
  const defaultProperties = {
    name: "",
    password: "",
    seed: "",
    installedApps: []
  };
  const userFile = await diskService.readJsonFile(constants.USER_FILE);
  return { ...defaultProperties, ...userFile };
}

function readLndRestHiddenService() {
  return constants.LND_REST_HIDDEN_SERVICE;
}

function readLndGrpcHiddenService() {
  return constants.LND_GRPC_HIDDEN_SERVICE;
}

function readLndCert() {
  return diskService.readUtf8File(constants.LND_CERT_FILE);
}

function readLndAdminMacaroon() {
  return diskService.readFile(constants.LND_ADMIN_MACAROON_FILE);
}

module.exports = {
  readBackupStatusFile,
  readTermsAcknowledgeFile,
  readManagedChannelsFile,
  writeManagedChannelsFile,
  writeTermsAcknowledgeFile,
  writeUserFile,
  readUserFile,
  readLndRestHiddenService,
  readLndGrpcHiddenService,
  readLndCert,
  readLndAdminMacaroon
};
