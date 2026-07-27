const mongoose = require('mongoose');

/**
 * Singleton document holding restaurant-level configuration that used to
 * only be settable by whoever controlled the server's .env file (i.e. the
 * original developer's own Gmail + app password). Storing it in the
 * database instead lets any admin configure their own sender email/app
 * password from the Admin -> Settings page in the app itself, so the
 * platform isn't tied to one person's inbox.
 *
 * There is only ever one document in this collection - it's fetched by
 * singleton key rather than by a caller-supplied id.
 */
const restaurantSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true },

    emailHost: { type: String, default: 'smtp.gmail.com' },
    emailPort: { type: Number, default: 587 },
    emailUser: { type: String, default: null }, // the sender address, e.g. restaurant's Gmail
    emailPassEncrypted: { type: String, default: null, select: false }, // app password, encrypted at rest
    emailSenderName: { type: String, default: 'SmartDine AI' },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantSettings', restaurantSettingsSchema);
