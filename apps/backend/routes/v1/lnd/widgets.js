const express = require('express');
const router = express.Router();

const safeHandler = require("utils/safeHandler");
const widgetLogic = require("logic/widgets.js");

router.get('/bitcoin-wallet', safeHandler(async(req, res) => {
  const widgetData = await widgetLogic.getBitcoinWalletWidgetData();
  res.json(widgetData);
}));

router.get('/lightning-wallet', safeHandler(async(req, res) => {
  const widgetData = await widgetLogic.getLightningWalletWidgetData();
  res.json(widgetData);
}));

router.get('/lightning-stats', safeHandler(async(req, res) => {
  const widgetData = await widgetLogic.getLightningStatsWidgetData();
  res.json(widgetData);
}));

module.exports = router;
