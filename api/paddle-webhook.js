import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rawBody = await buffer(req);
    const textBody = rawBody.toString("utf-8");

    // Convert x-www-form-urlencoded to object
    const params = new URLSearchParams(textBody);
    const body = Object.fromEntries(params.entries());

    console.log("🔔 Paddle Webhook Received:", body);

    // ✅ Send 200 immediately so Paddle doesn't abort
    res.status(200).json({ received: true });

    // ⚙️ Handle events here (non-blocking)
    if (body.alert_name === "subscription_payment_succeeded") {
      console.log("✅ Payment successful for subscription:", body.subscription_id);
    } else if (body.alert_name === "subscription_created") {
      console.log("🆕 Subscription created:", body.subscription_id);
    } else if (body.alert_name === "subscription_cancelled") {
      console.log("❌ Subscription cancelled:", body.subscription_id);
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
