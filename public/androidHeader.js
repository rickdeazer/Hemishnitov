/**
 * -----------Updates the Android App's header and status bar color------------.
 * @param {string} hexColor - The color in hex format (e.g., "#3302FFEA")
 * @param {number} [timing] - Optional transition duration in milliseconds (default: 800)
 */
function setAndroidHeaderColor(hexColor, timing = 800) {
    if (typeof hexColor !== "string") return;

    const isValidHex = /^#([0-9A-F]{6}|[0-9A-F]{8})$/i.test(hexColor);
    if (!isValidHex) return;

    if (
        window.AndroidInterface &&
        typeof window.AndroidInterface.updateHeaderColor === "function"
    ) {
        try {
            if (typeof timing === "number") {
                window.AndroidInterface.updateHeaderColor(hexColor, timing);
            } else {
                window.AndroidInterface.updateHeaderColor(hexColor);
            }
        } catch (e) {
            console.error(e);
        }
    }
}