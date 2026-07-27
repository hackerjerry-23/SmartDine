const asyncHandler = require('express-async-handler');
const RestaurantSettings = require('../models/RestaurantSettings');
const { encrypt } = require('../utils/crypto');
const { verifyTransport, invalidateEmailConfigCache } = require('../utils/email');

// GET /api/settings/email  (admin only)
// Never returns the app password - only whether one is configured.
const getEmailSettings = asyncHandler(async (req, res) => {
  const settings = await RestaurantSettings.findOne({ singletonKey: 'default' });
  res.json({
    emailHost: settings?.emailHost || 'smtp.gmail.com',
    emailPort: settings?.emailPort || 587,
    emailUser: settings?.emailUser || '',
    emailSenderName: settings?.emailSenderName || 'SmartDine AI',
    isConfigured: Boolean(settings?.emailUser && settings?.emailPassEncrypted),
    usingEnvFallback: !settings?.emailUser && Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
  });
});

// PUT /api/settings/email  (admin only)
// Body: { emailHost, emailPort, emailUser, emailPassword, emailSenderName }
// Any admin can call this from Admin -> Settings to use their own email
// account for outgoing mail - no more editing the server's .env file.
const updateEmailSettings = asyncHandler(async (req, res) => {
  const { emailHost, emailPort, emailUser, emailPassword, emailSenderName } = req.body;

  if (!emailUser || !emailPassword) {
    res.status(400);
    throw new Error('emailUser and emailPassword are required');
  }

  const candidate = {
    host: emailHost || 'smtp.gmail.com',
    port: Number(emailPort) || 587,
    user: emailUser,
    pass: emailPassword,
    senderName: emailSenderName || 'SmartDine AI',
  };

  try {
    await verifyTransport(candidate);
  } catch (err) {
    res.status(400);
    throw new Error(`Could not authenticate with those email credentials: ${err.message}`);
  }

  const settings = await RestaurantSettings.findOneAndUpdate(
    { singletonKey: 'default' },
    {
      singletonKey: 'default',
      emailHost: candidate.host,
      emailPort: candidate.port,
      emailUser: candidate.user,
      emailPassEncrypted: encrypt(candidate.pass),
      emailSenderName: candidate.senderName,
      updatedBy: req.user._id,
    },
    { upsert: true, new: true }
  );

  invalidateEmailConfigCache();

  res.json({
    emailHost: settings.emailHost,
    emailPort: settings.emailPort,
    emailUser: settings.emailUser,
    emailSenderName: settings.emailSenderName,
    isConfigured: true,
  });
});

module.exports = { getEmailSettings, updateEmailSettings };
