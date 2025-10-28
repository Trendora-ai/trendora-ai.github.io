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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    const data = body.data || {};

    const alertType =
      body.alert_name ||
      body.event_type ||
      body.type ||
      data.alert_name ||
      "unknown_alert";

    const eventData = {
      alert_name: alertType,
      status: body.status || body.state || data.status || "unknown",
      amount:
        body.amount ||
        body.sale_gross ||
        data.amount ||
        data.total ||
        data.transaction_total ||
        "0",
      currency:
        body.currency ||
        body.currency_code ||
        data.currency_code ||
        "USD",
      email:
        body.email ||
        body.customer_email ||
        data.customer_email ||
        data.customer?.email ||
        null,
      user_id:
        body.user_id ||
        body.customer_id ||
        data.customer_id ||
        data.customer?.id ||
        null,
      subscription_id:
        body.subscription_id ||
        data.subscription_id ||
        data.id ||
        null,
      plan_id:
        body.subscription_plan_id ||
        body.plan_id ||
        data.product_id ||
        data.items?.[0]?.price?.product_id ||
        null,
      checkout_id:
        body.checkout_id ||
        data.checkout_id ||
        data.transaction_id ||
        null,
      next_bill_date:
        body.next_bill_date ||
        data.next_billed_at ||
        data.billing_period?.next_billed_at ||
        null,
      event_time: body.event_time || new Date().toISOString(),
      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✅ Respond to Paddle immediately
    res.status(200).json({ success: true, alert: alertType });

    // 🔄 Firestore write happens asynchronously (won’t block response)
    db.collection("paddle_webhooks")
      .add(eventData)
      .then(() => console.log(`✅ Stored alert: ${alertType}`))
      .catch(err => console.error("❌ Firestore error:", err));

  } catch (err) {
    console.error("❌ Webhook error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
      }
