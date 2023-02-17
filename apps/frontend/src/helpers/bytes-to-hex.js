// Helper function to convert bytes to hex string
export default function bytesToHexString(byteObject) {
  const bytes = Object.values(byteObject);

  return bytes
    .map(function(byte) {
      return ("00" + (byte & 0xff).toString(16)).slice(-2); // eslint-disable-line no-magic-numbers
    })
    .join("");
}