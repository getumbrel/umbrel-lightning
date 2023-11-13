const mergeWith = require('lodash.mergewith');
const union = require('lodash.union');

const lndConfig = require('utils/lnd-config');
const diskService = require('services/disk');
const constants = require("utils/const");

const DEFAULT_CONFIG = require('utils/defaultConfig');

// lodash mergeWith customizer function to merge arrays and remove duplicates for multi-line config options like externalip
const mergeArraysAndRemoveDuplicates = (objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return union(objValue, srcValue);
  }
};

// merge config objects into single object with specific order of precedence
// Note for arrays: we currently do not have any config options that are arrays in the DEFAULT_CONFIG (e.g., like externalip).
// When we do, we will need to revisit the mergeArraysAndRemoveDuplicates customizer function and make sure a users config can override defaults if it makes sense.
const deriveConfigObject = (userLndConfigObject, configObject) => {
  return mergeWith({}, DEFAULT_CONFIG, userLndConfigObject, configObject, mergeArraysAndRemoveDuplicates);
}

// take in a config object and return and lnd.conf string
// whereby the umbrel json store has higher precedence
// but we keep the unmanaged LND conf
const deriveConfigFile = async (configObject) => {
  let userLndConfig = {};
  
  if (await diskService.fileExists(constants.LND_CONF_FILEPATH)) {
    const userLndConfFile = await diskService.readUtf8File(constants.LND_CONF_FILEPATH);
    userLndConfig = lndConfig.parse(userLndConfFile);
  }

  const derivedConfigObject = deriveConfigObject(userLndConfig, configObject);

  return lndConfig.generate(derivedConfigObject);
}

// writes umbrel-lnd.conf and settings.json to disk
// pass this function DEFAULT_CONFIG to reset the config to defaults
async function writeLndConfig(configObject) {
  const lndConfigString = await deriveConfigFile(configObject);
  await Promise.all([
    diskService.writePlainTextFile(constants.UMBREL_LND_CONF_FILEPATH, lndConfigString),
    diskService.writeJsonFile(constants.JSON_SETTINGS_FILE, {lnd: Object.keys(configObject).length > 0 ? configObject : DEFAULT_CONFIG})
  ]);
}

// checks to see if we need to regenerate umbrel-lnd.conf and/or settings.json on app start
async function isUmbrelLndConfUpToDate(config) {
  const newLndConfigString = await deriveConfigFile(config);

  let existingLndConfigString = await diskService.fileExists(constants.UMBREL_LND_CONF_FILEPATH)
                                ? await diskService.readUtf8File(constants.UMBREL_LND_CONF_FILEPATH)
                                : '';

  // compare new config to existing umbrel-lnd conf but
  // ignore the first line as it will contained a 'generated at' timestamp
  return newLndConfigString.split(/\r?\n/).slice(2).join('\n') === existingLndConfigString.split(/\r?\n/).slice(2).join('\n');
}

async function getConfig() {
  const config = await diskService.fileExists(constants.JSON_SETTINGS_FILE)
                  ? (await diskService.readJsonFile(constants.JSON_SETTINGS_FILE)).lnd
                  : {};                
  return deriveConfigObject(await getManagedSettingsFromLndConf(), config);
}

// parses lnd.conf and returns an object of only those settings that are managed by Umbrel in [settings.json[].lnd
async function getManagedSettingsFromLndConf() {
  let configObject = {};

  if (await diskService.fileExists(constants.LND_CONF_FILEPATH)) {
    const userLndConfigString = await diskService.readUtf8File(constants.LND_CONF_FILEPATH);
    configObject = lndConfig.getManagedConfig(lndConfig.parse(userLndConfigString), DEFAULT_CONFIG);
  }
  return configObject;
}

module.exports = {
  writeLndConfig,
  isUmbrelLndConfUpToDate,
  getConfig
}