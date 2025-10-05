import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing (important for Paddle)
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rawBody = await buffer(req);
    const textBody = rawBody.toString("utf-8");

    if (!textBody) {
      console.error("❌ Empty body received");
      return res.status(400).json({ error: "Empty body" });
    }

    // Convert x-www-form-urlencoded → JS object
    const params = new URLSearchParams(textBody);
    const body = Object.fromEntries(params.entries());

    console.log("🔔 Paddle Webhook Received:", body);

    // ✅ Send 200 immediately
    res.status(200).json({ received: true });

    // Test event handling
    if (body.alert_name) {
      console.log("⚙️ Event Name:", body.alert_name);
    } else {
      console.log("⚠️ No alert_name found in payload");
    }

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}
