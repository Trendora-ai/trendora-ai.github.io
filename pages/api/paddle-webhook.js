// pages/api/paddle-webhook.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const event = req.body;

    // Test ke liye console me log karo
    console.log("🔔 Paddle Event Received:", event);

    // Example checks
    if (event?.alert_name === "subscription_created") {
      console.log("✅ Subscription Created:", event);
    }

    if (event?.alert_name === "subscription_cancelled") {
      console.log("❌ Subscription Cancelled:", event);
    }

    if (event?.alert_name === "payment_succeeded") {
      console.log("💰 Payment Succeeded:", event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).json({ error: "Webhook handling failed" });
  }
}
