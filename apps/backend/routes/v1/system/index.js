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
  "/terms-acknowledge",
  safeHandler(async (req, res) => {
    const {acceptedTerms} = await diskLogic.getJsonStore();;

    return res.json(acceptedTerms);
  })
);

router.post(
  "/terms-acknowledge",
  safeHandler(async (req, res) => {
    await diskLogic.updateJsonStore({acceptedTerms: true});

    return res.json(true);
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
