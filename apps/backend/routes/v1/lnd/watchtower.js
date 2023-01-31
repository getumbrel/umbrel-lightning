const express = require("express");
const router = express.Router();

const lndLogic = require("logic/lightning.js");
const safeHandler = require("utils/safeHandler");

router.get('/watchtower-info', safeHandler(async(req, res) => {
    const watchtowerInfo = await lndLogic.getWatchtowerServiceInfo();
    return res.json(watchtowerInfo);
}));

router.post('/add-watchtower', safeHandler(async(req, res) => {
    const uri = req.body.uri;
    try {
        await lndLogic.addWatchtower(uri);
        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error}); // show error in UI 
    }
}));

router.post('/remove-watchtower', safeHandler(async(req, res) => {
    const pubkey = req.body.pubkey;
    try {
        await lndLogic.removeWatchtower(pubkey);
        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error}); // show error in UI 
    }
}));

router.post('/remove-watchtower-address', safeHandler(async(req, res) => {
    const {pubkey, address} = req.body;
    try {
        await lndLogic.removeWatchtower(pubkey, address);
        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error}); // show error in UI 
    }
}));

router.get('/list-watchtowers', safeHandler(async(req, res) => {
    const towers = await lndLogic.listWatchtowers();
    res.json(towers);
}));

module.exports = router;