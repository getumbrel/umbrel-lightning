const express = require("express");
const router = express.Router();
const lightningLogic = require("logic/lightning.js");
const safeHandler = require("utils/safeHandler");

router.get(
  "/",
  safeHandler((req, res) =>
    lightningLogic.generateAddress().then(address => res.json(address))
  )
);

module.exports = router;
