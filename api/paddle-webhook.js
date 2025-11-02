// api/paddle-webhook.js
import admin from "firebase-admin";

// Prevent double initialization in serverless environment
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("🔥 Firebase initialized successfully");
  } catch (err) {
    console.error("❌ Firebase init error:", err);
  }
}

const db = admin.firestore();

// Vercel: disable default body parser so we can read raw body
export const config = {
  api: { bodyParser: false },
};

// Safe raw-body reader (works well on Vercel)
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function ensureFutureDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    // If already in the future, keep it
    if (d > new Date()) return d.toISOString();
    // Else return null (caller may set fallback)
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const rawBody = await getRawBody(req);
    if (!rawBody) {
      console.warn("⚠️ Empty raw body");
      return res.status(400).json({ error: "Empty body" });
    }

    // Parse as JSON first, fallback to form-urlencoded
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    console.log("🔔 Paddle Webhook Received:", body);

    // Detect alert/event type from multiple possible fields
    const alertType =
      body.alert_name ||
      body.event_type ||
      body.type ||
      body?.data?.alert_name ||
      "unknown_alert";

    const data = body.data || {};

    // Try to get next_bill_date from many places, ensure it's valid/future
    let nextBillDate =
      body.next_bill_date || data.next_billed_at || data.next_payment_date || null;
    nextBillDate = ensureFutureDate(nextBillDate);

    // If no valid future nextBillDate, set a fallback 30 days from now
    if (!nextBillDate) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      nextBillDate = fallback.toISOString();
      console.log("🕓 next_bill_date fallback set to:", nextBillDate);
    }

    // Normalize email (support sandbox/test payloads)
    const email =
      body.email ||
      body.customer_email ||
      data.customer_email ||
      data.customer?.email ||
      data.user_email ||
      (data.customer_id || body.customer_id
        ? `sandbox_${data.customer_id || body.customer_id}@test.com`
        : null);

    // Build event payload to store
    const eventData = {
      alert_name: alertType,
      status: body.status || data.status || "unknown",
      amount:
        body.sale_gross ||
        body.amount ||
        data.amount ||
        data.total ||
        data?.items?.[0]?.price?.unit_price?.amount ||
        "0",
      currency: body.currency || data.currency_code || data.currency || "USD",
      email: email || null,
      subscription_id: body.subscription_id || data.id || data.subscription_id || null,
      plan_id:
        body.subscription_plan_id ||
        body.plan_id ||
        data.product_id ||
        data.items?.[0]?.product_id ||
        null,
      next_bill_date: nextBillDate,
      user_id: body.user_id || body.customer_id || data.user_id || data.customer_id || null,
      event_time: body.event_time || data.occurred_at || new Date().toISOString(),
      raw: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 1) Store webhook event (always)
    const logRef = await db.collection("paddle_webhooks").add(eventData);
    console.log(`✅ Stored webhook event (${alertType}) as ${logRef.id}`);

    // 2) If email is present, ensure user doc exists and update plan/status
    if (eventData.email) {
      const userRef = db.collection("users").doc(eventData.email);
      const userSnap = await userRef.get();

      // If user does not exist, create base user doc (so downstream reads exist)
      if (!userSnap.exists) {
        const createdDoc = {
          email: eventData.email,
          plan: "free",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await userRef.set(createdDoc, { merge: true });
        console.log(`🆕 Created user doc for ${eventData.email}`);
      }

      // Decide new plan based on alert type
      let newPlan = "free";
      if (
        alertType.includes("activated") ||
        alertType.includes("payment_succeeded") ||
        alertType.includes("subscription.created") ||
        alertType.includes("subscription.activated")
      ) {
        newPlan = "pro";
      } else if (
        alertType.includes("canceled") ||
        alertType.includes("payment_failed") ||
        alertType.includes("subscription.paused") ||
        alertType.includes("subscription.canceled")
      ) {
        newPlan = "free";
      }

      // Prepare clean update object (no nulls)
      const updateData = Object.fromEntries(
        Object.entries({
          plan: newPlan,
          subscription_id: eventData.subscription_id,
          next_bill_date: eventData.next_bill_date,
          status: eventData.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }).filter(([_, v]) => v !== null && v !== undefined)
      );

      await userRef.set(updateData, { merge: true });
      console.log(`📦 User ${eventData.email} updated → ${newPlan}`);
    } else {
      console.warn("⚠️ Email missing in webhook; skipping users update.");
    }

    // 3) Auto-downgrade expired pro users (non-blocking but we await)
    try {
      const usersSnapshot = await db.collection("users").get();
      const now = new Date();
      for (const doc of usersSnapshot.docs) {
        const user = doc.data();
        if (user.plan === "pro" && user.next_bill_date) {
          const nb = new Date(user.next_bill_date);
          if (!Number.isNaN(nb.getTime()) && nb < now) {
            await doc.ref.update({
              plan: "free",
              status: "expired",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`🔁 Auto-downgraded expired user: ${doc.id}`);
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Auto-downgrade pass failed:", err);
    }

    // Respond to Paddle quickly (they need 200)
    return res.status(200).json({ received: true, alert: alertType });
  } catch (error) {
    console.error("❌ Paddle Webhook Error:", error);
    if (!res.headersSent) return res.status(500).json({ error: error.message });
  }
}
