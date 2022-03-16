const constants = require("utils/const.js");
const diskService = require("services/disk");

function readBackupStatusFile() {
  return diskService.readJsonFile(constants.BACKUP_STATUS_FILE);
}

function readManagedChannelsFile() {
  return diskService
    .readJsonFile(constants.MANAGED_CHANNELS_FILE)
    .catch(() => Promise.resolve({}));
}

function writeManagedChannelsFile(data) {
  return diskService.writeJsonFile(constants.MANAGED_CHANNELS_FILE, data);
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
  readManagedChannelsFile,
  writeManagedChannelsFile,
  readLndRestHiddenService,
  readLndGrpcHiddenService,
  readLndCert,
  readLndAdminMacaroon,
};
