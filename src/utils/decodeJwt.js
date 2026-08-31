// Decodifica o payload de um JWT sem depender de atob/Buffer,
// que não estão disponíveis em todos os runtimes do React Native.
const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const base64UrlToBytes = (input) => {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) str += "=";

  const bytes = [];
  for (let i = 0; i < str.length; i += 4) {
    const chunk = [0, 1, 2, 3].map((j) => {
      const c = str[i + j];
      return c === "=" || c === undefined ? -1 : B64_ALPHABET.indexOf(c);
    });
    const n =
      (chunk[0] << 18) |
      (chunk[1] << 12) |
      ((chunk[2] < 0 ? 0 : chunk[2]) << 6) |
      (chunk[3] < 0 ? 0 : chunk[3]);
    bytes.push((n >> 16) & 255);
    if (chunk[2] >= 0) bytes.push((n >> 8) & 255);
    if (chunk[3] >= 0) bytes.push(n & 255);
  }
  return bytes;
};

const bytesToUtf8 = (bytes) =>
  decodeURIComponent(
    bytes.map((b) => "%" + b.toString(16).padStart(2, "0")).join("")
  );

const decodeJwt = (token) => {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Token JWT inválido");
  return JSON.parse(bytesToUtf8(base64UrlToBytes(payload)));
};

export default decodeJwt;
