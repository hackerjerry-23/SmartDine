/**
 * Small AES-256-GCM helper used to store the restaurant's SMTP app
 * password at rest instead of in plain text. This uses SETTINGS_ENCRYPTION_KEY
 * (a server-level secret every deployment sets once) - not any individual
 * person's email credentials - so it stays decoupled from "whose Gmail is
 * this" entirely.
 */
const crypto = require('crypto');

function getKey() {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('SETTINGS_ENCRYPTION_KEY (or JWT_SECRET as a fallback) must be set to store email settings securely.');
  }
  // Derive a fixed-length 32-byte key from whatever secret string is configured.
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(plainText) {
  if (!plainText) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decrypt(payload) {
  if (!payload) return null;
  const [ivHex, tagHex, dataHex] = payload.split(':');
  if (!ivHex || !tagHex || !dataHex) return null;
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
