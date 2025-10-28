import admin from "firebase-admin";

// ✅ Prevent double initialization errors
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
  api: { bodyParser: false },
};

// ✅ Safe async body reader
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ message: "Method Not Allowed" });

    const rawBody = await getRawBody(req);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    console.log("🔔 Paddle Webhook Body:", body);

    const alertType =
      body.alert_name ||
      body.event_type ||
      body.type ||
      body?.data?.alert_name ||
      "unknown_alert";

    const data = body.data || {};

    // ✅ Smart extraction with fallbacks
    const items = Array.isArray(data.items) ? data.items : [];
    const mainItem = items[0] || {};

    const eventData = {
      alert_name: alertType,
      status:
        body.status || data.status || body.state || "unknown",

      amount:
        body.sale_gross ||
        body.amount ||
        data.amount ||
        data.total ||
        mainItem?.price?.unit_price?.amount ||
        "0",

      currency:
        body.currency ||
        data.currency_code ||
        data.currency ||
        mainItem?.price?.unit_price?.currency_code ||
        "USD",

      email:
        body.email ||
        body.customer_email ||
        data.customer_email ||
        data.customer?.email ||
        data.customer?.name || // fallback (Paddle sandbox often lacks email)
        null,

      subscription_id:
        body.subscription_id ||
        data.id ||
        data.subscription_id ||
        null,

      plan_id:
        body.subscription_plan_id ||
        data.plan_id ||
        data.product_id ||
        mainItem?.product_id ||
        mainItem?.product?.name || // ✅ plan/product name
        null,

      checkout_id:
        body.checkout_id ||
        data.checkout_id ||
        null,

      next_bill_date:
        data.next_billed_at ||
        mainItem?.next_billed_at ||
        data.current_billing_period?.ends_at ||
        data.next_payment_date ||
        null,

      user_id:
        body.user_id ||
        body.customer_id ||
        data.user_id ||
        data.customer_id ||
        null,

      event_time:
        body.event_time ||
        data.occurred_at ||
        new Date().toISOString(),

      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✅ Non-blocking Firestore write
    db.collection("paddle_webhooks").add(eventData)
      .then(() => console.log(`✅ Stored alert: ${alertType}`))
      .catch(err => console.error("⚠️ Firestore save error:", err));

    // ✅ Respond immediately to Paddle
    return res.status(200).json({ received: true, alert: alertType });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    if (!res.headersSent)
      res.status(500).json({ error: error.message });
  }
}
