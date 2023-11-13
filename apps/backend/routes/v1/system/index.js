const express = require("express");
const router = express.Router();

const systemLogic = require("logic/system");
const diskLogic = require('logic/disk');
const safeHandler = require("utils/safeHandler");
const constants = require("utils/const.js");
const validator = require("utils/validator.js");


router.get(
  "/lndconnect-urls",
  safeHandler(async (req, res) => {
    const urls = await systemLogic.getLndConnectUrls();

    return res.status(constants.STATUS_CODES.OK).json(urls);
  })
);

router.get(
  "/backup-status",
  safeHandler(async (req, res) => {
    const backup = await systemLogic.getBackupStatus();

    return res.status(constants.STATUS_CODES.OK).json(backup);
  })
);

// backupOverTor is a boolean that determines whether channel backup files should be uploaded/downloaded over Tor or clearnet
router.get(
  "/backup-over-tor",
  safeHandler(async (req, res) => {
    const {backupOverTor} = await diskLogic.getJsonStore();

    return res.json(backupOverTor);
  })
);

router.post(
  "/backup-over-tor",
  safeHandler(async (req, res) => {
    const {backupOverTor} = req.body;

    try {
      validator.isBoolean(backupOverTor);
    } catch (error) {
      return next(error);
    }

    await diskLogic.updateJsonStore({backupOverTor});

    return res.json({success: true});
  })
);

// retrieves whether the latest backup attempt was successfully uploaded
router.get(
  "/recent-backup-success",
  safeHandler(async (req, res) => {
    const {mostRecentBackupSuccess} = await diskLogic.getJsonStore();

    return res.json(mostRecentBackupSuccess);
  })
);

router.get(
  "/onboarding",
  safeHandler(async (req, res) => {
    const {onboarding} = await diskLogic.getJsonStore();

    return res.json(onboarding);
  })
);

router.post(
  "/onboarding",
  safeHandler(async (req, res) => {
    await diskLogic.updateJsonStore({onboarding: false});

    return res.json(false);
  })
);

router.get(
  "/seed",
  safeHandler(async (req, res) => {
    const {seed} = await diskLogic.getJsonStore();

    return res.json({seed});
  })
);

router.get(
  "/seed-exists",
  safeHandler(async (req, res) => {
    const {seed} = await diskLogic.getJsonStore();

    const seedExists = Boolean(seed && seed.length);

    return res.json(seedExists);
  })
);

router.get("/explorer", safeHandler(async (req, res) => res.json({
  port: constants.EXPLORER_PORT,
  hiddenService: constants.EXPLORER_HIDDEN_SERVICE,
})));

module.exports = router;
