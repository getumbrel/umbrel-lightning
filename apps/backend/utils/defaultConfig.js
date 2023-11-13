// keys are not in standard camelCase in order to maintain identical names between the umbrel-lnd.conf file and the [settings.json].lnd file.
// Full list of options are found here: https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf
module.exports = {
// Application Options
  'tlsautorefresh': true,
  'sync-freelist': false,
  'payments-expiration-grace-period': '30m',
  'maxpendingchannels': 1,
  'minchansize': 20000,
  'maxchansize': 16777215,
  'coop-close-target-confs': 6,
  'stagger-initial-reconnect': false,
  'max-cltv-expiry': 2016,
  'max-commit-fee-rate-anchors': 10,
  'accept-keysend': false,
  'accept-amp': true,
  'gc-canceled-invoices-on-startup': false,
  'gc-canceled-invoices-on-the-fly': false,
  'allow-circular-route': false,
  'alias': '',
  'color': '#3399FF',
// Bitcoin
  'bitcoin.defaultchanconfs': 2,
  'bitcoin.basefee': 1000,
  'bitcoin.feerate': 1,
  'bitcoin.timelockdelta': 80,
// watchtower
  'watchtower.active': false,
// wtclient
  'wtclient.active': false,
  'wtclient.sweep-fee-rate': 10,
// routerrpc
  'routerrpc.minrtprob': 0.01,
  'routerrpc.apriorihopprob': 0.6,
  'routerrpc.aprioriweight': 0.5,
  'routerrpc.penaltyhalflife': '1h',
  'routerrpc.attemptcost': 100,
  'routerrpc.attemptcostppm': 1000,
  'routerrpc.maxmchistory': 1000,
// caches
  'caches.channel-cache-size': 20000,
// protocol
  'protocol.wumbo-channels': false,
// bolt
  'db.bolt.auto-compact': false,
  'db.bolt.auto-compact-min-age': '168h',
// rpcmiddleware
// Lightning Terminal (litd) now requires this flag to be set or it will not start up
  'rpcmiddleware.enable': true,
// routing
  'routing.strictgraphpruning': false
}