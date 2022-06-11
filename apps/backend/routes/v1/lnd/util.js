const express = require("express");
const router = express.Router();

const applicationLogic = require("logic/application.js");
const safeHandler = require("utils/safeHandler");

router.post(
  "/backup",
  safeHandler((req, res) =>
    applicationLogic.lndBackup().then(response => res.json(response))
  )
);

router.get(
  "/download-channel-backup",
  safeHandler((req, res) =>
    applicationLogic
      .lndChannnelBackup()
      .then(backupFile => res.download(backupFile, "channel.backup"))
  )
);

module.exports = router;
