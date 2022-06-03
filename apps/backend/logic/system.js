const encode = require("lndconnect").encode;

const diskLogic = require("logic/disk");
const NodeError = require("models/errors.js").NodeError;

const constants = require("utils/const.js");

async function getSeed() {
  try {
    const { seed } = await diskLogic.readUserFile();

    return { seed: seed.split(",") };
  } catch (error) {
    console.log("error: ", error);
    throw new NodeError("Unable to retrieve mnemonic seed");
  }
}

async function getBackupStatus() {
  try {
    const status = await diskLogic.readBackupStatusFile();
    return status;
  } catch (error) {
    throw new NodeError("Unable to get backup status");
  }
}

async function getTermsAcknowledge() {
  try {
    const terms = await diskLogic.readTermsAcknowledgeFile();
    return terms.accepted;
  } catch (error) {
    throw new NodeError("Unable to get terms status");
  }
}

async function writeTermsAcknowledge() {
  try {
    const status = await diskLogic.writeTermsAcknowledgeFile();
    return status;
  } catch (error) {
    throw new NodeError("Unable to write terms status");
  }
}

async function getLndConnectUrls() {
  let cert;
  try {
    cert = await diskLogic.readLndCert();
  } catch (error) {
    throw new NodeError("Unable to read lnd cert file");
  }

  let macaroon;
  try {
    macaroon = await diskLogic.readLndAdminMacaroon();
  } catch (error) {
    throw new NodeError("Unable to read lnd macaroon file");
  }

  let restTorHost;
  try {
    restTorHost = await diskLogic.readLndRestHiddenService();
    restTorHost += `:${constants.LND_REST_PORT}`;
  } catch (error) {
    throw new NodeError("Unable to read lnd REST hostname file");
  }
  const restTor = encode({
    host: restTorHost,
    cert,
    macaroon
  });

  let grpcTorHost;
  try {
    grpcTorHost = await diskLogic.readLndGrpcHiddenService();
    grpcTorHost += `:${constants.LND_GRPC_PORT}`;
  } catch (error) {
    throw new NodeError("Unable to read lnd gRPC hostname file");
  }
  const grpcTor = encode({
    host: grpcTorHost,
    cert,
    macaroon
  });

  let restLocalHost = `${constants.DEVICE_DOMAIN_NAME}:${constants.LND_REST_PORT}}`;
  const restLocal = encode({
    host: restLocalHost,
    cert,
    macaroon
  });

  let grpcLocalHost = `${constants.DEVICE_DOMAIN_NAME}:${constants.LND_GRPC_PORT}`;
  const grpcLocal = encode({
    host: grpcLocalHost,
    cert,
    macaroon
  });

  return {
    restTor,
    restLocal,
    grpcTor,
    grpcLocal
  };
}

module.exports = {
  getSeed,
  getBackupStatus,
  getTermsAcknowledge,
  writeTermsAcknowledge,
  getLndConnectUrls
};
