const express = require("express");
const router = express.Router();

const { SocksProxyAgent } = require("socks-proxy-agent");
const axios = require("axios");

const safeHandler = require("utils/safeHandler");
const constants = require("utils/const.js");

const PRICE_API_URL = "https://mempool.space/api/v1/prices";

const agent = constants.TOR_PROXY_IP && constants.TOR_PROXY_PORT
  ? new SocksProxyAgent(
    `socks5h://${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`
  )
  : undefined;

router.get(
  "/price",
  safeHandler(async (req, res) => {
    // Default to USD
    const currency = String(req.query.currency || "USD").trim().toUpperCase();
    const response = await axios({
      url: PRICE_API_URL,
      httpsAgent: agent,
      method: "GET",
    }).catch(() => null);

    const price = response && response.data && response.data[currency];

    if (price !== undefined && price !== null && Number.isFinite(Number(price))) {
      return res.status(constants.STATUS_CODES.OK).json({
        [currency]: Number(price)
      });
    }

    return res.status(constants.STATUS_CODES.BAD_GATEWAY).json();
  })
);

module.exports = router;
