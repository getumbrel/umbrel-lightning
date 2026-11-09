// Parse a BIP 321 bitcoin: URI, returns null if not one
export default function parseBip321(uri) {
  const match = /^bitcoin:([^?]*)\??(.*)$/i.exec(uri.trim());
  if (!match) return null;

  const params = {};
  new URLSearchParams(match[2]).forEach((value, key) => {
    params[key.toLowerCase()] = value;
  });

  // Unknown required params make the URI invalid
  if (Object.keys(params).some((key) => key.startsWith("req-"))) return null;

  return {
    address: match[1] || params.bc || params.tb || params.bcrt,
    amount: params.amount,
    lightning: params.lightning,
  };
}
