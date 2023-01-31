// value argument is passed as a string
function stringToType(key, value) {
  if (value === "" || value === null || value === undefined) return "";
  if (BOOLEAN_KEYS.includes(key)) {
    if (value === 'true' || value === '1') {
      return true;
    } else if (value === 'false' || value === '0') {
      return false;
    } else {
      throw new Error(`Invalid value for boolean key ${key}: ${value}`); 
    }
  }
  if (!isNaN(value)) {
    return Number(value);
  }
  return value;
}

// these are only those Boolean config options that are managed by Umbrel
const BOOLEAN_KEYS = [
  "tlsautorefresh",
  "sync-freelist",
  "stagger-initial-reconnect",
  "accept-amp",
  "gc-canceled-invoices-on-startup",
  "gc-canceled-invoices-on-the-fly",
  "allow-circular-route",
  "watchtower.active",
  "wtclient.active",
  "protocol.wumbo-channels",
  "db.bolt.auto-compact",
  "rpcmiddleware.enable",
  "routing.strictgraphpruning"
];

module.exports = stringToType;