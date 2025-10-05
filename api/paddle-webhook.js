export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    console.log("🔔 Paddle Webhook Received:", body);

    // ✅ Always send 200 immediately to Paddle
    res.status(200).json({ received: true });

    // ⚙️ Then handle the event logic separately (non-blocking)
    if (body.alert_name === "subscription_payment_succeeded") {
      console.log("✅ Payment successful for subscription:", body.subscription_id);
    } else if (body.alert_name === "subscription_created") {
      console.log("🆕 Subscription created:", body.subscription_id);
    } else if (body.alert_name === "subscription_cancelled") {
      console.log("❌ Subscription cancelled:", body.subscription_id);
    }
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
