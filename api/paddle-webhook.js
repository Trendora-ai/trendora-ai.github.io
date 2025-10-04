export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    console.log("🔔 Paddle Webhook Received:", body);

    // Example: handle events
    if (body.alert_name === "subscription_payment_succeeded") {
      console.log("✅ Payment successful for subscription:", body.subscription_id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
      }
