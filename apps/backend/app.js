require("module-alias/register");
require("module-alias").addPath(".");
require("dotenv").config({ path: require("find-config")(".env") });

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const constants = require("utils/const.js");

// Keep requestCorrelationId middleware as the first middleware. Otherwise we risk losing logs.
const requestCorrelationMiddleware = require("middlewares/requestCorrelationId.js"); // eslint-disable-line id-length
const camelCaseReqMiddleware = require("middlewares/camelCaseRequest.js")
  .camelCaseRequest;
const corsOptions = require("middlewares/cors.js").corsOptions;
const errorHandleMiddleware = require("middlewares/errorHandling.js");

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

// TODO: add creation logic

// LND Unlocker
if (constants.LND_WALLET_PASSWORD) {
  const LndUnlocker = require("logic/lnd-unlocker");
  lndUnlocker = new LndUnlocker(constants.LND_WALLET_PASSWORD);
  lndUnlocker.start();
}
