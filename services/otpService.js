const { sendVerification } = require("../services/twilioVerify");

/**
 * Sends an OTP via Twilio Verify and updates the user's OTP expiry timestamp.
 * @param {Object} user - Mongoose user document (must contain phoneNumber).
 */
async function sendOtpToUser(user) {
  if (!user || !user.phoneNumber) {
    throw new Error("User or phoneNumber missing");
  }
  // Twilio Verify generates a new OTP each call.
  await sendVerification(user.phoneNumber);
  // Record expiry (60 seconds from now) for UI/analytics purposes.
  user.otpExpires = new Date(Date.now() + 60 * 1000);
  await user.save();
}

module.exports = { sendOtpToUser };
