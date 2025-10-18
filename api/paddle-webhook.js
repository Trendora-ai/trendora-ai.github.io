import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("🔥 Firebase initialized successfully");
  } catch (err) {
    console.error("❌ Firebase init error:", err);
  }
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", err => reject(err));
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const rawBody = await getRawBody(req);

    // 🧩 Try parsing as JSON first, fallback to form data
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    console.log("🔔 Paddle Webhook Body:", body);

    // ✅ Smarter event detection
    const alertType =
      body.alert_name ||
      body.event_type ||
      body.type ||
      (body.data && body.data.alert_name) ||
      "unknown_alert";

    const eventData = {
      alert_name: alertType,
      status: body.status || body.state || body.data?.status || "unknown",
      amount:
        body.sale_gross ||
        body.amount ||
        body.data?.amount ||
        body.data?.total ||
        "0",
      currency: body.currency || body.currency_code || "USD",
      email: body.email || body.customer_email || body.data?.customer_email || null,
      subscription_id:
        body.subscription_id ||
        body.data?.id ||
        body.data?.subscription_id ||
        null,
      plan_id:
        body.subscription_plan_id ||
        body.plan_id ||
        body.data?.product_id ||
        null,
      checkout_id: body.checkout_id || body.data?.checkout_id || null,
      next_bill_date:
        body.next_bill_date ||
        body.data?.next_billed_at ||
        body.data?.next_payment_date ||
        null,
      user_id: body.user_id || body.customer_id || body.data?.user_id || null,
      event_time: body.event_time || new Date().toISOString(),
      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("paddle_webhooks").add(eventData);
    console.log(`✅ Stored alert: ${alertType}`);

    if (!res.headersSent) {
      res.status(200).json({ received: true });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}
