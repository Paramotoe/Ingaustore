import crypto from "crypto";

// RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30s step).
export function generateSecret(): string {
  // 20 bytes base32
  const buf = crypto.randomBytes(20);
  return base32Encode(buf);
}

export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Math.floor(Date.now() / 1000);
  const step = 30;
  for (let i = -window; i <= window; i++) {
    const counter = Math.floor(now / step) + i;
    if (hotp(secret, counter) === clean) return true;
  }
  return false;
}

export function otpauthUri(secret: string, email: string, issuer = "Ingaustore"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  // write counter as big-endian
  let c = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = c & 0xff; c = Math.floor(c / 256); }
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, "0");
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, output = "";
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}
function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32.indexOf(clean[i]);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}