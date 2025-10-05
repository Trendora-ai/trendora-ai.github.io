export const config = {
  api: {
    bodyParser: false, // Paddle sends raw form data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 🧾 Get raw body
    let rawBody = "";
    await new Promise((resolve, reject) => {
      req.on("data", chunk => (rawBody += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    // 🔄 Parse x-www-form-urlencoded
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());

    console.log("🔔 Paddle Webhook Received:", body.alert_name);

    // 🧠 Handle Paddle events
    switch (body.alert_name) {
      case "subscription_created":
        console.log("✅ New subscription created:", body.email);
        break;
      case "subscription_payment_succeeded":
        console.log("💰 Payment succeeded for subscription:", body.subscription_id);
        break;
      case "subscription_cancelled":
        console.log("⚠️ Subscription cancelled:", body.subscription_id);
        break;
      default:
        console.log("ℹ️ Other event:", body.alert_name);
    }

    // ✅ Send a clean response back
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true }));

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}
