/* eslint-disable id-length */
module.exports = {
  LN_REQUIRED_CONFIRMATIONS: 3,
  LND_STATUS_CODES: {
    UNAVAILABLE: 14,
    UNKNOWN: 2
  },
  USER_FILE: process.env.USER_FILE || "/db/user.json",
  MANAGED_CHANNELS_FILE: "/channel-data/managedChannels.json",
  LND_SEED: process.env.APP_SEED,
  LND_WALLET_PASSWORD: process.env.LND_WALLET_PASSWORD || "moneyprintergobrrr",
  REQUEST_CORRELATION_NAMESPACE_KEY: "umbrel-middleware-request",
  REQUEST_CORRELATION_ID_KEY: "reqId",
  STATUS_CODES: {
    BAD_GATEWAY: 502,
    FORBIDDEN: 403,
    OK: 200
  },
  LND_REST_HIDDEN_SERVICE:
    process.env.LND_REST_HIDDEN_SERVICE || "/var/lib/tor/lnd-rest/hostname",
  LND_GRPC_HIDDEN_SERVICE:
    process.env.LND_GRPC_HIDDEN_SERVICE || "/var/lib/tor/lnd-grpc/hostname",
  LND_CERT_FILE: process.env.TLS_FILE || "/lnd/tls.cert",
  LND_ADMIN_MACAROON_FILE:
    process.env.MACAROON_FILE || process.env.MACAROON_DIR
      ? `${process.env.MACAROON_DIR}admin.macaroon`
      : "/lnd/data/chain/bitcoin/mainnet/admin.macaroon",
  TOR_PROXY_IP: process.env.TOR_PROXY_IP || "192.168.0.1",
  TOR_PROXY_PORT: process.env.TOR_PROXY_PORT || 9050,

  BACKUP_STATUS_FILE:
    process.env.BACKUP_STATUS_FILE || "/statuses/backup-status.json",

  TERMS_ACKNOWLEDGE_FILE:
    process.env.TERMS_ACKNOWLEDGE_FILE || "/statuses/terms-acknowledge.json"
};
