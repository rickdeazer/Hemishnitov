
/**
 * Triggers a local Android notification.
 * @param {string} title - The title of the notification.
 * @param {string} message - The body text of the notification.
 */
function sendAndroidNotification(title, message) {
    if (window.AndroidInterface && window.AndroidInterface.showLocalNotification) {
        window.AndroidInterface.showLocalNotification(title, message);
    } else {
        console.log("Android App not detected. Notification:", title, "-", message);
    }
}//sendAndroidNotification("Upload Complete!", "Your new post is now live.");