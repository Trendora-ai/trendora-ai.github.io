import admin from "firebase-admin";

// ✅ Prevent double initialization
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

// ✅ Helper to read raw body
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

    console.log("🔔 Paddle Webhook Received:", body);

    // ✅ Detect alert type
    const alertType =
      body.alert_name ||
      body.event_type ||
      body.type ||
      body?.data?.alert_name ||
      "unknown_alert";

    const data = body.data || {};

    // ✅ Handle next_bill_date safely
    let nextBillDate =
      body.next_bill_date ||
      data.next_billed_at ||
      data.next_payment_date ||
      null;

    // 🧩 Fix missing or old date
    if (!nextBillDate || new Date(nextBillDate) < new Date()) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      nextBillDate = nextMonth.toISOString();
      console.log(`🕓 next_bill_date fixed to future: ${nextBillDate}`);
    }

    // ✅ Collect webhook data
    const email =
      body.email ||
      body.customer_email ||
      data.customer_email ||
      data.customer?.email ||
      data.user_email ||
      `sandbox_${data.customer_id || body.customer_id || "unknown"}@test.com`;

    const eventData = {
      alert_name: alertType,
      status: body.status || data.status || "unknown",
      amount:
        body.amount ||
        data.amount ||
        data.total ||
        data?.items?.[0]?.price?.unit_price?.amount ||
        "0",
      currency:
        body.currency ||
        data.currency_code ||
        data.currency ||
        "USD",
      email,
      subscription_id:
        body.subscription_id ||
        data.id ||
        data.subscription_id ||
        null,
      plan_id:
        body.subscription_plan_id ||
        data.product_id ||
        data.items?.[0]?.product_id ||
        null,
      next_bill_date: nextBillDate,
      event_time:
        body.event_time ||
        data.occurred_at ||
        new Date().toISOString(),
      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✅ 1. Store webhook event with unique ID
    await db.collection("paddle_webhooks").add(eventData);
    console.log(`✅ Webhook stored: ${alertType}`);

    // ✅ 2. Update User Plan
    if (email) {
      const userRef = db.collection("users").doc(email);
      const userDoc = await userRef.get();

      // ➤ If user does NOT exist, create it
      if (!userDoc.exists) {
        await userRef.set({
          email,
          plan: "free",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`🆕 User created in Firestore: ${email}`);
      }

      let newPlan = "free";
      if (
        ["activated", "payment_succeeded", "subscription.created"].some(t =>
          alertType.includes(t)
        )
      ) {
        newPlan = "pro";
      }

      if (
        ["canceled", "payment_failed", "subscription.paused"].some(t =>
          alertType.includes(t)
        )
      ) {
        newPlan = "free";
      }

      const cleanData = Object.fromEntries(
        Object.entries({
          plan: newPlan,
          subscription_id: eventData.subscription_id,
          next_bill_date: nextBillDate,
          status: eventData.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }).filter(([_, v]) => v !== null && v !== undefined)
      );

      await userRef.set(cleanData, { merge: true });
      console.log(`📦 User updated: ${email} → ${newPlan}`);
    }

    // ✅ 3. Auto-downgrade expired users
    const usersSnapshot = await db.collection("users").get();
    const now = new Date();

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      if (user.plan === "pro" && user.next_bill_date) {
        const nextBillingDate = new Date(user.next_bill_date);
        if (nextBillingDate < now) {
          await doc.ref.update({
            plan: "free",
            status: "expired",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`🔁 Downgraded expired user: ${doc.id}`);
        }
      }
    }

    return res.status(200).json({ success: true, alert: alertType });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    if (!res.headersSent)
      res.status(500).json({ error: error.message });
  }
        }
