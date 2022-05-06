const express = require("express");
const router = express.Router();

const bitcoind = require("logic/bitcoind.js");

const safeHandler = require("utils/safeHandler");

router.get(
  "/sync",
  safeHandler((req, res) =>
    bitcoind.getSyncStatus().then(status => {
      return res.json(status);
    })
  )
);

module.exports = router;
