const express = require("express");
const router = express.Router();
const lightningLogic = require("logic/lightning.js");
const diskLogic = require("logic/disk");
const safeHandler = require("utils/safeHandler");
const constants = require("utils/const.js");
const logger = require("utils/logger.js");
const validator = require("utils/validator.js");
const LndError = require("models/errors.js").LndError;

router.post(
  "/create",
  safeHandler(async (req, res) => {
    let seed = typeof req.body.seed === 'string' && req.body.seed.split(' ');
    console.log('Attempting to create new wallet...');
    if (!seed) {
      ({seed} = await lightningLogic.generateSeed());
    }
    await lightningLogic.initializeWallet(constants.LND_WALLET_PASSWORD, seed);
    await diskLogic.updateJsonStore({seed})
    console.log('Wallet created!');
    res.json({success: true});
  })
);

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
