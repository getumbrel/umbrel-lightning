require("module-alias/register");
require("module-alias").addPath(".");
require("dotenv").config({ path: require("find-config")(".env") });

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const lightningLogic = require("logic/lightning");
const diskLogic = require("logic/disk");

const constants = require("utils/const.js");

// Keep requestCorrelationId middleware as the first middleware. Otherwise we risk losing logs.
const requestCorrelationMiddleware = require("middlewares/requestCorrelationId.js"); // eslint-disable-line id-length
const camelCaseReqMiddleware = require("middlewares/camelCaseRequest.js")
  .camelCaseRequest;
const corsOptions = require("middlewares/cors.js").corsOptions;
const errorHandleMiddleware = require("middlewares/errorHandling.js");
const LndError = require("models/errors.js").LndError;

const logger = require("utils/logger.js");

const address = require("routes/v1/lnd/address.js");
const channel = require("routes/v1/lnd/channel.js");
const info = require("routes/v1/lnd/info.js");
const lightning = require("routes/v1/lnd/lightning.js");
const transaction = require("routes/v1/lnd/transaction.js");
const util = require("routes/v1/lnd/util.js");
const wallet = require("routes/v1/lnd/wallet.js");
const pages = require("routes/v1/pages.js");
const system = require("routes/v1/system/index.js");
const external = require("routes/v1/external.js");
const ping = require("routes/ping.js");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(requestCorrelationMiddleware);
app.use(camelCaseReqMiddleware);
app.use(morgan(logger.morganConfiguration));

// serve frontend
app.use("/", express.static("../frontend/dist"));

app.use("/v1/lnd/address", address);
app.use("/v1/lnd/channel", channel);
app.use("/v1/lnd/info", info);
app.use("/v1/lnd/lightning", lightning);
app.use("/v1/lnd/transaction", transaction);
app.use("/v1/lnd/wallet", wallet);
app.use("/v1/lnd/util", util);
app.use("/v1/pages", pages);
app.use("/v1/system", system);
app.use("/v1/external", external);
app.use("/ping", ping);

app.use(errorHandleMiddleware);
app.use((req, res) => {
  res.status(404).json(); // eslint-disable-line no-magic-numbers
});

module.exports = app;

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const initLnd = async () => {
  // Wait for LND to be operational
  while (true) {
    console.log('Checking LND status...');
    const {operational, unlocked} = await lightningLogic.getStatus();
    if (unlocked) {
      console.log('LND already unlocked!');
      return;
    }
    if (operational) {
      console.log('LND ready!');
      break;
    }
    console.log('Waiting for LND...');
    await delay(SECOND_IN_MS);
  }

  // Attempt to unlock
  try {
    console.log('Attempting to unlock wallet...');
    await lightningLogic.unlockWallet(constants.LND_WALLET_PASSWORD);
    console.log('Wallet unlocked!');
    return;
  } catch (error) {
    const reason = error.error && error.error.details || error.message;
    console.log(`Unlocking wallet failed: "${reason}"`);
  }

  // Attempt to create a new wallet
  try {
    console.log('Attempting to create new wallet...')
    const {seed} = await lightningLogic.generateSeed();
    await lightningLogic.initializeWallet(constants.LND_WALLET_PASSWORD, seed);
    await diskLogic.writeUserFile({ seed: seed.join(",") });
    console.log('Wallet created!');
  } catch (error) {
    const reason = error.error && error.error.details || error.message;
    console.log(`Error: "${reason}"`);
  }

};

// Retry init every minute incase LND crashes
(async () => {
  while (true) {
    await initLnd();
    await delay(60 * MINUTE_IN_MS);
  }
})();