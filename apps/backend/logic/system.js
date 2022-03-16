const encode = require("lndconnect").encode;

const diskLogic = require("logic/disk");
const NodeError = require("models/errors.js").NodeError;

const constants = require("utils/const.js");

async function getBackupStatus() {
  try {
    const status = await diskLogic.readBackupStatusFile();
    return status;
  } catch (error) {
    throw new NodeError("Unable to get backup status");
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
    restTorHost += ":8080";
  } catch (error) {
    throw new NodeError("Unable to read lnd REST hostname file");
  }
  const restTor = encode({
    host: restTorHost,
    cert,
    macaroon,
  });

  let grpcTorHost;
  try {
    grpcTorHost = await diskLogic.readLndGrpcHiddenService();
    grpcTorHost += ":10009";
  } catch (error) {
    throw new NodeError("Unable to read lnd gRPC hostname file");
  }
  const grpcTor = encode({
    host: grpcTorHost,
    cert,
    macaroon,
  });

  let restLocalHost = `${constants.DEVICE_HOSTNAME}:8080`;
  const restLocal = encode({
    host: restLocalHost,
    cert,
    macaroon,
  });

  let grpcLocalHost = `${constants.DEVICE_HOSTNAME}:10009`;
  const grpcLocal = encode({
    host: grpcLocalHost,
    cert,
    macaroon,
  });

  return {
    restTor,
    restLocal,
    grpcTor,
    grpcLocal,
  };
}

module.exports = {
  getBackupStatus,
  getLndConnectUrls,
};
