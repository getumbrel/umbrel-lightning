const express = require("express");
const router = express.Router();

const constants = require("utils/const");
const lndLogic = require("logic/lightning");
const diskService = require("services/disk");
const configLogic = require('logic/config');
const safeHandler = require("utils/safeHandler");
const lndConfMap = require("utils/lndConfMap");
const DEFAULT_CONFIG = require("utils/defaultConfig");

router.get('/lnd-config', safeHandler(async(req, res) => {
    const settings = await diskService.readJsonFile(constants.JSON_SETTINGS_FILE);
    return res.json(settings.lnd);
  }));

// POSTing an empty object {} for lndConfig triggers a reset to DEFAULT_CONFIG
router.post('/lnd-config', safeHandler(async (req, res) => {
    // TODO: remove mapKeys if we remove legacy camelCaseReqMiddleware (converts req keys to camelCase)
    const newLndConfig = Object.keys(req.body.lndConfig).length > 0 ? mapKeys(req.body.lndConfig) : DEFAULT_CONFIG;

    const validationErrors = validateSettings(newLndConfig);
    if (validationErrors.length > 0) {
        return res.status(400).json({ status: 'validation_error', validationErrors });
    }

    // Store original settings.json and umbrel-lnd.conf in case we need to revert
    const oldSettingsJson = await diskService.readJsonFile(constants.JSON_SETTINGS_FILE);
    const oldUmbrelLndConfFile = await diskService.readUtf8File(constants.UMBREL_LND_CONF_FILEPATH);

    try {
        await configLogic.writeLndConfig(newLndConfig);
        await lndLogic.stopDaemon();
        return res.json({ status: 'success' });
    } catch (error) {
        // revert to old config files
        await Promise.all([
            diskService.writeJsonFile(constants.JSON_SETTINGS_FILE, oldSettingsJson),
            diskService.writePlainTextFile(constants.UMBREL_LND_CONF_FILEPATH, oldUmbrelLndConfFile)
        ]);

        const message = error?.error?.details === 'wallet locked, unlock it to enable full RPC access'
                        ? 'LND is almost ready, please wait a few seconds and try again.'
                        : 'Something went wrong. Please try again later.'
    
        res.status(500).json({ status: 'failure', message }); // show error to user in UI
    }
}));

function mapKeys(postObject) {
    const configObject = {};
    for (const [key, value] of Object.entries(postObject)) {
        configObject[lndConfMap[key]] = value;
    }
    return configObject;
}

function validateSettings(settings) {
    const errors = [];

    // APPLICATION OPTIONS

    //  sync-freelist (database sync)
    const syncFreelist = settings["sync-freelist"];
    if (typeof syncFreelist !== "boolean") {
        errors.push(booleanError("Database Sync"));
    }
     // payments-expiration-grace-period (payments expiration grace period)
    const paymentsExpirationGracePeriod = settings["payments-expiration-grace-period"];
    if (typeof paymentsExpirationGracePeriod !== "string" || /^[0-9]+[shm]$/.test(paymentsExpirationGracePeriod) === false) {
        errors.push(timeError("Payments Expiration Grace Period"));
    }
    // maxpendingchannels (max pending channels per peer)
    const maxPendingChannels = settings["maxpendingchannels"];
    if (typeof maxPendingChannels !== "number" || maxPendingChannels < 0) {
        errors.push(numberError("Maximum Pending Channels per Peer", 0));
    }
    // minchansize (minimum channel size)
    const minChanSize = settings["minchansize"];
    if (typeof minChanSize !== "number" || minChanSize < 1 || minChanSize > 16_777_215) {
        errors.push(numberError("Minimum Channel Size", 1, 16_777_215));
    }
    // maxchansize (maximum channel size)
    const maxChanSize = settings["maxchansize"];
    const wumboChannels = settings["protocol.wumbo-channels"];
    const upperBound = wumboChannels ? 1_000_000_000 : 16_777_215;
    if (typeof maxChanSize !== "number" || maxChanSize < 1 || maxChanSize > upperBound) {
        errors.push(`Maximum Channel Size must be between 1 and ${upperBound} sats when Larger Channels are ${wumboChannels ? "enabled" : "disabled"}`);
    }

    if (minChanSize >= maxChanSize) {
        errors.push("Minimum Channel Size must be less than Maximum Channel Size");
    }
    // coop-close-target-confs (confirmations for channel close)
    const coopCloseTargetConfs = settings["coop-close-target-confs"];
    if (typeof coopCloseTargetConfs !== "number" || coopCloseTargetConfs < 1) {
        errors.push(numberError("Confirmations for Channel Close", 1));
    }
    // stagger-initial-reconnect (delay initial reconnections)
    const staggerInitialReconnect = settings["stagger-initial-reconnect"];
    if (typeof staggerInitialReconnect !== "boolean") {
        errors.push(booleanError("Delay Initial Reconnections"));
    }
    // max-cltv-expiry (maximum payment lock-up time)
    const maxCltvExpiry = settings["max-cltv-expiry"];
    if (typeof maxCltvExpiry !== "number" || maxCltvExpiry < 1) {
        errors.push(numberError("Maximum Payment Lock-up Time", 1));
    }
    // max-commit-fee-rate-anchors (maximum anchor channel commit fee rate)
    const maxCommitFeeRateAnchors = settings["max-commit-fee-rate-anchors"];
    if (typeof maxCommitFeeRateAnchors !== "number" || maxCommitFeeRateAnchors < 1) {
        errors.push(numberError("Maximum Anchor Channel Commit Fee Rate", "1 sat/vByte"));
    }
    // accept-keysend (receive keysend payments)
    const acceptKeysend = settings["accept-keysend"];
    if (typeof acceptKeysend !== "boolean") {
        errors.push(booleanError("Receive Keysend Payments"));
    }
    //  accept-amp (automatic multipath payments)
    const acceptAmp = settings["accept-amp"];
    if (typeof acceptAmp !== "boolean") {
        errors.push(booleanError("Automatic Multipath Payments"));
    }
    //  gc-canceled-invoices-on-startup (delete cancelled invoices on startup)
    const gcCanceledInvoicesOnStartup = settings["gc-canceled-invoices-on-startup"];
    if (typeof gcCanceledInvoicesOnStartup !== "boolean") {
        errors.push(booleanError("Delete Cancelled Invoices on Startup"));
    }
    //  gc-canceled-invoices-on-the-fly (delete cancelled invoices in real-time)
    const gcCanceledInvoicesOnTheFly = settings["gc-canceled-invoices-on-the-fly"];
    if (typeof gcCanceledInvoicesOnTheFly !== "boolean") {
        errors.push(booleanError("Delete Cancelled Invoices in Real-time"));
    }
    // allow-circular-route (circular payment routes)
    const allowCircularRoute = settings["allow-circular-route"];
    if (typeof allowCircularRoute !== "boolean") {
        errors.push(booleanError("Circular Payment Routes"));
    }
    // alias
    // alias can be up to 32 utf-8 characters long
    const alias = settings["alias"];
    if (typeof alias !== "string" || Buffer.byteLength(alias, 'utf8') > 32) {
        errors.push("Node Name can only be a maximum of 32 UTF-8 characters long");
    }
  
    //  color
    const color = settings["color"];
    if (typeof color !== "string" || /^#[0-9a-fA-F]{6}$/.test(color) === false) {
        errors.push("Node Color must be a valid six character hex code");
    }
    
    // BITCOIN

    // bitcoin.defaultchanconfs (confirmations for channel open)
    const defaultChanConfs = settings["bitcoin.defaultchanconfs"];
    if (typeof defaultChanConfs !== "number" || defaultChanConfs < 0) {
        errors.push(numberError("Confirmations for Channel Open", 0));
    }
    // bitcoin.basefee (base forwarding fee)
    const baseFee = settings["bitcoin.basefee"];
    if (typeof baseFee !== "number" || baseFee < 0) {
        errors.push(numberError("Base Forwarding Fee", 0));
    }
    // bitcoin.feerate (forwarding fee rate)
    const feeRate = settings["bitcoin.feerate"];
    if (typeof feeRate !== "number" || feeRate < 0) {
        errors.push(numberError("Forwarding Fee Rate", 0));
    }
    // bitcoin.timelockdelta (timelock delta)
    const timeLockDelta = settings["bitcoin.timelockdelta"];
    if (typeof timeLockDelta !== "number" || timeLockDelta < 18) {
        errors.push(numberError("Timelock Delta", 18));
    }

    // WATCHTOWER

    // watchtower.active (watchtower service)
    const watchtowerActive = settings["watchtower.active"];
    if (typeof watchtowerActive !== "boolean") {
        errors.push(booleanError("Watchtower Service"));
    }

    // WTCLIENT

    // wtclient.active (watchtower client)
    const wtclientActive = settings["wtclient.active"];
    if (typeof wtclientActive !== "boolean") {
        errors.push(booleanError("Watchtower Client"));
    }
    // wtclient.sweep-fee-rate (watchtower client sweep fee rate)
    const sweepFeeRate = settings["wtclient.sweep-fee-rate"];
    if (typeof sweepFeeRate !== "number" || sweepFeeRate < 0) {
        errors.push(numberError("Watchtower Client Sweep Fee Rate", 0));
    }

    // ROUTER RPC

    // routerrpc.minrtprob (minimum route success probability)
    const minRtProb = settings["routerrpc.minrtprob"];
    if (typeof minRtProb !== "number" || minRtProb < 0 || minRtProb > 1) {
        errors.push(numberError("Minimum Route Success Probability", 0, 1));
    }
    // routerrpc.apriorihopprob (default hop success probability)
    const aprioriHopProb = settings["routerrpc.apriorihopprob"];
    if (typeof aprioriHopProb !== "number" || aprioriHopProb < 0 || aprioriHopProb > 1) {
        errors.push(numberError("Default Hop Success Probability", 0, 1));
    }

    // routerrpc.aprioriweight (default probablity weight)
    const aprioriWeight = settings["routerrpc.aprioriweight"];
    if (typeof aprioriWeight !== "number" || aprioriWeight < 0 || aprioriWeight > 1) {
        errors.push(numberError("Default Probablity Weight", 0, 1));
    }
    // routerrpc.penaltyhalflife (penalty half-life)
    const penaltyHalfLife = settings["routerrpc.penaltyhalflife"];
    if (typeof penaltyHalfLife !== "string" || /^[0-9]+[shm]$/.test(penaltyHalfLife) === false) {
        errors.push(timeError("Penalty Half-life"));
    }
    // routerrpc.attemptcost (failed payment cost)
    const attemptCost = settings["routerrpc.attemptcost"];
    if (typeof attemptCost !== "number" || attemptCost < 0) {
        errors.push(numberError("Failed Payment Cost", 0));
    }
    // routerrpc.attemptcostppm (proportional failed payment cost)
    const attemptCostPpm = settings["routerrpc.attemptcostppm"];
    if (typeof attemptCostPpm !== "number" || attemptCostPpm < 0) {
        errors.push(numberError("Proportional Failed Payment Cost", 0));
    }
    // routerrpc.maxmchistory (maximum mission control history)
    const maxMcHistory = settings["routerrpc.maxmchistory"];
    if (typeof maxMcHistory !== "number" || maxMcHistory < 0) {
        errors.push(numberError("Maximum Mission Control History", 0));
    }

    // CACHES

    // caches.channel-cache-size (maximum channel cache entries)
    const channelCacheSize = settings["caches.channel-cache-size"];
    if (typeof channelCacheSize !== "number" || channelCacheSize < 1000) {
        errors.push(numberError("Maximum Channel Cache Entries", 1000));
    }

    // PROTOCOL
    // wumboChannels are defined above under maxchansize
    // const wumboChannels = settings["protocol.wumbo-channels"];

    // protocol.wumbo-channels (larger channels)
    if (typeof wumboChannels !== "boolean") {
        errors.push(booleanError("Larger Channels"));
    }

    // BOLT

    // db.bolt.auto-compact (automatic database compaction)
    const autoCompact = settings["db.bolt.auto-compact"];
    if (typeof autoCompact !== "boolean") {
        errors.push(booleanError("Automatic Database Compaction"));
    }
    // db.bolt.auto-compact-min-age (database re-compaction delay)
    const autoCompactMinAge = settings["db.bolt.auto-compact-min-age"];
    if (typeof autoCompactMinAge !== "string" || /^[0-9]+[shm]$/.test(autoCompactMinAge) === false) {
        errors.push(timeError("Database Re-compaction Delay"));
    }

    // ROUTING

    // routing.strictgraphpruning (strict graph pruning)
    const strictGraphPruning = settings["routing.strictgraphpruning"];
    if (typeof strictGraphPruning !== "boolean") {
        errors.push(booleanError("Strict Graph Pruning"));
    }
    
    return errors;
}

function booleanError(settingName) {
    return `Invalid value for ${settingName}. Please try toggling it on/off again.`;
}

function timeError(settingName) {
    return `Enter a valid number and choose the time unit for ${settingName}.`;
}

function numberError(settingName, min, max) {
    return `${settingName} must be ${max ? `between ${min} and ${max}` : `at least ${min}`}.`;
}

module.exports = router;