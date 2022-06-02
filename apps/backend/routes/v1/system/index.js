const express = require("express");
const router = express.Router();

const systemLogic = require("logic/system");
const diskLogic = require('logic/disk');
const safeHandler = require("utils/safeHandler");
const constants = require("utils/const.js");

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

router.get(
  "/onboarding",
  safeHandler(async (req, res) => {
    const {onboarding} = await diskLogic.getJsonStore();;

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

module.exports = router;
