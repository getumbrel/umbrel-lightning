const constants = require("utils/const");
const diskService = require("services/disk");

function readBackupStatusFile() {
  return diskService.readJsonFile(constants.BACKUP_STATUS_FILE);
}

function readBackupFile() {
  return diskService.readFile(constants.CHANNEL_BACKUP_FILE);
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

async function getJsonStore() {
  const defaultProperties = {
    onboarding: true,
    seed: [],
    backupOverTor: true, // by default we backup over Tor
    mostRecentBackupSuccess: true, // default to true to prevent warning modal rendering before first backup is attempted
  };
  try {
    const jsonStore = await diskService.readJsonFile(constants.JSON_STORE_FILE);
    return { ...defaultProperties, ...jsonStore };
  } catch (error) {
    return defaultProperties;
  }
}

// There's a race condition here id you do two updates in parallel but it's fine for our current use case
async function updateJsonStore(newProps) {
  const jsonStore = await getJsonStore();
  return diskService.writeJsonFile(constants.JSON_STORE_FILE, {
    ...jsonStore,
    ...newProps
  });
}

module.exports = {
  getJsonStore,
  updateJsonStore,
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
  readLndAdminMacaroon,
  readBackupFile
};
