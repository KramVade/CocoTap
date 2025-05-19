const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.validateUser = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    // Set custom claim for the user
    await admin.auth().setCustomUserClaims(context.auth.uid, {
      validated: true
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while validating the user.'
    );
  }
}); 