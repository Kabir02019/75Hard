// CallMeBot is a small free, personal-use WhatsApp API. Each recipient
// opts in once (by messaging the bot from their own WhatsApp) and gets
// back an API key that is tied to their phone number. See the README for
// the one-time setup steps.
//
// This is an unofficial hobby service, not something to depend on for
// anything important — if it ever goes down or is slow, the app should
// keep working fine without it.

export async function sendWhatsAppReminder(
  phoneNumber: string,
  apiKey: string,
  message: string
): Promise<boolean> {
  const phoneNumberIsSet = phoneNumber.length > 0;
  const apiKeyIsSet = apiKey.length > 0;

  if (phoneNumberIsSet === false || apiKeyIsSet === false) {
    return false;
  }

  const encodedMessage = encodeURIComponent(message);
  const encodedPhoneNumber = encodeURIComponent(phoneNumber);
  const requestUrl =
    "https://api.callmebot.com/whatsapp.php?phone=" +
    encodedPhoneNumber +
    "&text=" +
    encodedMessage +
    "&apikey=" +
    encodeURIComponent(apiKey);

  try {
    const response = await fetch(requestUrl, { method: "GET" });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("CallMeBot request failed:", error);
    return false;
  }
}
