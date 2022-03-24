const crypto = require('crypto');
const {CipherSeed} = require('aezeed');

const deterministicAezeed = seedEntropy => {
  const derivedEntropy = crypto.createHmac('sha256', seedEntropy).update('aezeed').digest();
  const entropyBufferLength = 16;
  const saltBufferLength = 5;
  const entropy = derivedEntropy.slice(0, entropyBufferLength);
  const salt = derivedEntropy.slice(entropyBufferLength, entropyBufferLength + saltBufferLength);
  const internalVersion = 0;
  const birthday = 0;

  const seed = new CipherSeed(entropy, salt, internalVersion, birthday);
  return seed.toMnemonic();
};

module.exports = deterministicAezeed;
