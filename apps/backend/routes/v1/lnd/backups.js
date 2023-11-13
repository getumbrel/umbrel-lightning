const express = require("express");
const router = express.Router();

const diskLogic = require("logic/disk");
const safeHandler = require("utils/safeHandler");
const backups = require("utils/backups");
const lnd = require("services/lnd");

router.get("/", safeHandler(async (req, res) => {
  try {
    const seed = (await diskLogic.getJsonStore()).seed.join(' ');
    const timestamps = await backups.listBackups(seed);
  
    res.json({timestamps});
  } catch (error) {
    res.json({success: false, error: error.message});
  }
}));

router.get("/latest", safeHandler(async (req, res) => {
  const {previousBackupTime} = await diskLogic.getJsonStore();
  res.json({timestamp: previousBackupTime});
}));

router.post("/recover", safeHandler(async (req, res) => {
  const {timestamp} = req.body;
  let backup = req.body.backup && Buffer.from(req.body.backup, 'base64');
  if (!backup) {
    const seed = (await diskLogic.getJsonStore()).seed.join(' ');
    backup = await backups.getBackupFromTimestamp(seed, timestamp);
  }
  await lnd.recoverBackup(backup);

  res.json({success: true});
}));

module.exports = router;
