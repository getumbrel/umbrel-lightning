const express = require("express");
const router = express.Router();

const systemLogic = require("logic/system");
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

module.exports = router;
