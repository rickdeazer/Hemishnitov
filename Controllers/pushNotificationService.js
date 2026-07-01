import admin from 'firebase-admin';
// import serviceAccount from '../config/firebase-auth.json' with { type: 'json' };
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

/**
 * 🚀 PRODUCTION MMUN NOTIFICATION ENGINE (Data-Only Version)
 * Wakes the app's background service to handle custom logic (Calls vs. Msgs).
 * 
 * @param {string} type - "call" (Full-screen/Ringtone) or "msg" (Standard)
 * @param {string} deviceToken - Target FCM token
 * @param {string} title - Heading
 * @param {string} message - Body
 * @param {string} redirectUrl - WebView link (Optional)
 * @param {boolean} [isHeadsUp=false] - High priority flag
 */
async function sendPushNotification(type, deviceToken, title, message, redirectUrl = "", isHeadsUp = false) {
    if (!deviceToken || !title || !message) {
        console.error("sendPushNotification: Missing required parameters.");
        return false;
    }

    const payload = {
        token: deviceToken,
        // 🚨 IMPORTANT: 'data' only! No 'notification' key here.
        // This ensures the app handles the display logic, not the OS.
        data: {
            type: type,                 // Custom: "msg" or "call"
            title: title,
            message: message,
            targetUrl: redirectUrl,
            priority: String(isHeadsUp) // "true" or "false"
        },
        android: {
            priority: "high" // ⚡ Necessary to wake the device from Doze mode
        }
    };

    try {
        const response = await admin.messaging().send(payload);
        console.log(`✅ [${type.toUpperCase()}] Data-Notification Sent! ID:`, response);
        return true;
    } catch (error) {
        console.error("FCM error: ❌ Failed to send:", error.message);
        return false;
    }
}

export { sendPushNotification };