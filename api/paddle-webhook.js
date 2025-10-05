export const config = {
  api: {
    bodyParser: false, // Required: Paddle sends x-www-form-urlencoded
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Read raw body from stream
    let rawBody = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (rawBody += chunk.toString()));
      req.on("end", resolve);
      req.on("error", reject);
    });

    // Convert to object (Paddle sends x-www-form-urlencoded)
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());

    console.log("🔔 Paddle Webhook Received:", body);

    // ✅ Always respond 200 quickly
    res.status(200).json({ received: true });

    // 🧠 Example handling
    if (body.alert_name === "subscription_created") {
      console.log("✅ New subscription created for:", body.email);
    } else if (body.alert_name === "subscription_payment_succeeded") {
      console.log("💰 Payment success for:", body.subscription_id);
    } else if (body.alert_name === "subscription_cancelled") {
      console.log("⚠️ Subscription cancelled:", body.subscription_id);
    } else {
      console.log("ℹ️ Other alert:", body.alert_name);
    }

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
                  }
