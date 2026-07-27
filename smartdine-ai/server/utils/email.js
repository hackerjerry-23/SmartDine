const nodemailer = require('nodemailer');
const { decrypt } = require('./crypto');

// Cache the resolved config for a short window so every email send doesn't
// hit the database, but changes made in Admin -> Settings still take
// effect within a few seconds without a server restart.
const CACHE_TTL_MS = 30 * 1000;
let cached = { config: null, expiresAt: 0 };

/**
 * Resolves SMTP config in priority order:
 *   1. Restaurant-level settings saved via Admin -> Settings (per-deployment,
 *      entered by that restaurant's own admin - this is the "everyone can
 *      configure their own email" path).
 *   2. .env fallback (EMAIL_HOST/EMAIL_USER/EMAIL_PASS) for local dev or
 *      deployments that prefer environment-based config.
 */
async function resolveConfig() {
  if (cached.config && Date.now() < cached.expiresAt) return cached.config;

  let config = null;
  try {
    const RestaurantSettings = require('../models/RestaurantSettings');
    const settings = await RestaurantSettings.findOne({ singletonKey: 'default' }).select('+emailPassEncrypted');
    if (settings?.emailUser && settings?.emailPassEncrypted) {
      config = {
        host: settings.emailHost,
        port: settings.emailPort,
        user: settings.emailUser,
        pass: decrypt(settings.emailPassEncrypted),
        senderName: settings.emailSenderName || 'SmartDine AI',
      };
    }
  } catch (err) {
    console.error('Could not load email settings from database:', err.message);
  }

  if (!config && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      senderName: 'SmartDine AI',
    };
  }

  cached = { config, expiresAt: Date.now() + CACHE_TTL_MS };
  return config;
}

/** Call this whenever settings are saved so the next email uses them immediately. */
function invalidateEmailConfigCache() {
  cached = { config: null, expiresAt: 0 };
}

function buildTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) return; // skip silently if no address available (e.g. guest walk-in)

  const config = await resolveConfig();
  if (!config) {
    console.warn(`Email not sent to ${to} - no email sender is configured yet (Admin -> Settings, or EMAIL_USER/EMAIL_PASS in .env).`);
    return;
  }

  const transporter = buildTransporter(config);
  return transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to,
    subject,
    text,
    html,
  });
}

/** Used by the Settings page to verify credentials before saving. */
async function verifyTransport(config) {
  const transporter = buildTransporter(config);
  await transporter.verify();
}

module.exports = { sendEmail, verifyTransport, invalidateEmailConfigCache, resolveConfig };
