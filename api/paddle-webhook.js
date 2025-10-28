import admin from "firebase-admin";

// 🔥 Initialize Firebase only once
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

// 🚫 Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ Safe way to read raw body for Vercel
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const rawBody = await getRawBody(req);

    // Try parsing JSON; if fails, fallback to URL-encoded
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    console.log("🔔 Paddle Webhook Received:", body);

    const alertType = body.alert_name || "unknown_alert";

    const eventData = {
      alert_name: alertType,
      subscription_id: body.subscription_id || body.id || null,
      email: body.email || null,
      user_id: body.user_id || body.customer_id || null,
      status: body.status || body.state || "unknown",
      amount: body.sale_gross || body.amount || "0",
      currency: body.currency || body.currency_code || "USD",
      next_bill_date: body.next_bill_date || body.next_billed_at || null,
      checkout_id: body.checkout_id || null,
      plan_id: body.subscription_plan_id || body.product_id || null,
      event_time: body.event_time || body.created_at || new Date().toISOString(),
      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("paddle_webhooks").add(eventData);
    console.log(`✅ Stored alert in Firestore: ${alertType}`);

    // ✅ Respond immediately to prevent timeout/abort
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ error: error.message });
  }
        }
