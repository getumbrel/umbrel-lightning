require("module-alias/register");
require("module-alias").addPath(".");
require("dotenv").config({ path: require("find-config")(".env") });

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const lightningLogic = require("logic/lightning");
const LndUnlocker = require("logic/lnd-unlocker");

const constants = require("utils/const.js");
const deterministicAezeed = require("utils/deterministic-aezeed.js")

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
const { Cipher } = require("crypto");
const app = express();

// Handles CORS
app.use(cors(corsOptions));

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

async function init() {
  // only init if we have a seed.
  // maybe not required if wallet already created?
  if (constants.LND_SEED) {
    const lndStatus = await lightningLogic.getStatus();

    if (lndStatus.operational) {
      try {
        const seed = deterministicAezeed(constants.LND_SEED);
        const parsedSeed = seed.split(" ");

        const password = constants.LND_WALLET_PASSWORD;

        lightningLogic
          .initializeWallet(password, parsedSeed)
          .then(() => {
            // New wallet created successfully, so unlock
            lndUnlocker = new LndUnlocker(constants.LND_WALLET_PASSWORD);
            lndUnlocker.start();
          })
          .catch((error) => {
            if (error instanceof LndError) {
              // Wallet already exists, so unlock
              if (
                error.error &&
                error.error.details ===
                  "Macaroon exists, therefore wallet already exists"
              ) {
                lndUnlocker = new LndUnlocker(constants.LND_WALLET_PASSWORD);
                lndUnlocker.start();
              }
            }
          });
      } catch (e) {
        console.log("initializeWallet error: ", e);
      }
    }
  }
}

init();

// LND Unlocker
// if (constants.LND_WALLET_PASSWORD) {
//   const LndUnlocker = require("logic/lnd-unlocker");
//   lndUnlocker = new LndUnlocker(constants.LND_WALLET_PASSWORD);
//   lndUnlocker.start();
// }
