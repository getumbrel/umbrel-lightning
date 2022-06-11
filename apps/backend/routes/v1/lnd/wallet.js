const express = require("express");
const router = express.Router();
const lightningLogic = require("logic/lightning.js");
const safeHandler = require("utils/safeHandler");
const constants = require("utils/const.js");
const logger = require("utils/logger.js");
const validator = require("utils/validator.js");
const LndError = require("models/errors.js").LndError;

router.get(
  "/btc",
  safeHandler((req, res) =>
    lightningLogic.getWalletBalance().then(balance => res.json(balance))
  )
);

router.get(
  "/lightning",
  safeHandler((req, res) =>
    lightningLogic.getChannelBalance().then(balance => res.json(balance))
  )
);

module.exports = router;
