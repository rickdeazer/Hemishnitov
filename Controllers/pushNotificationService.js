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
 * @param {string} [redirectUrl=""] - WebView link (Optional)
 * @param {boolean} [isHeadsUp=false] - High priority flag
 * @param {string|string[]} [images=[]] - Single image URL string OR array of image URL strings
 */
async function sendPushNotification(type, deviceToken, title, message, redirectUrl = "", isHeadsUp = false, images = []) {
    if (!deviceToken || !title || !message) {
        console.error("sendPushNotification: Missing required parameters.");
        return false;
    }

    // Normalize images input (handles single string URL, array of URLs, or empty)
    const imageList = Array.isArray(images)
        ? images.filter(url => typeof url === 'string' && url.trim().length > 0)
        : (typeof images === 'string' && images.trim().length > 0 ? [images.trim()] : []);

    const payload = {
        token: deviceToken,
        // 🚨 IMPORTANT: 'data' only! No 'notification' key here.
        // This ensures the app handles the display logic, not the OS.
        data: {
            type: String(type),
            title: String(title),
            message: String(message),
            targetUrl: String(redirectUrl),
            priority: String(isHeadsUp),
            imageUrl: imageList.length > 0 ? imageList[0] : "", // Primary image fallback
            images: JSON.stringify(imageList)                    // JSON array of image URLs
        },
        android: {
            priority: isHeadsUp ? "high" : "normal" // ⚡ Necessary to wake the device from Doze mode
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
/*
STRUCTURE:

CALLING WITH A SINGLE IMAGE:
sendPushNotification(
    "msg",
    token3, 
    `${username} liked your photo`, 
    `${message}`, 
    `https://${APP_URL}/modern/${username}`,
    false, // isHeadsUp
    "https://mmun.rickdeazer.com/uploads/photo1.jpg" // Single image URL string
);

CALLING WITH MUTLTIPLE IMAGES:
sendPushNotification(
    "msg",
     token3, 
    `${username} added 3 new photos`, 
    `${message}`, 
    `https://${APP_URL}/post/123`,
    true, // isHeadsUp
    [
        "https://mmun.rickdeazer.com/uploads/photo1.jpg",
        "https://mmun.rickdeazer.com/uploads/photo2.jpg",
        "https://mmun.rickdeazer.com/uploads/photo3.jpg"
    ] // Array of image URLs
);

*/