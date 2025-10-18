// File: pages/api/paddle-webhook.js
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

// Helper function to read raw request body
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
    if (!rawBody) {
      return res.status(400).json({ error: "Empty body" });
    }

    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());
    console.log("🔔 Paddle Webhook:", body);

    // 🧠 Store all Paddle events
    const alertType = body.alert_name || "unknown_alert";

    const eventData = {
      alert_name: alertType,
      subscription_id: body.subscription_id || null,
      email: body.email || null,
      user_id: body.user_id || null,
      status: body.status || "unknown",
      amount: body.sale_gross || body.amount || "0",
      currency: body.currency || "USD",
      next_bill_date: body.next_bill_date || null,
      checkout_id: body.checkout_id || null,
      plan_id: body.subscription_plan_id || null,
      event_time: body.event_time || new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("paddle_webhooks").add(eventData);
    console.log(`✅ Stored alert: ${alertType}`);

    if (!res.headersSent) {
      res.status(200).json({ received: true });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    try {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    } catch (sendErr) {
      console.error("⚠️ Response send failed:", sendErr);
    }
  }
        }
