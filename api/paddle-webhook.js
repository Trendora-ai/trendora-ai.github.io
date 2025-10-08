import { buffer } from "micro";
import admin from "firebase-admin";

export const config = {
  api: {
    bodyParser: false, // disable automatic parsing
  },
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log("🔥 Firebase initialized successfully");
  } catch (err) {
    console.error("❌ Firebase init error:", err);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rawBody = (await buffer(req)).toString();
    console.log("🧾 RAW BODY:", rawBody);

    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params);

    console.log("🔔 Parsed Webhook Body:", body);

    if (body.alert_name === "subscription_payment_succeeded") {
      const paymentData = {
        subscription_id: body.subscription_id || "missing_id",
        email: body.email || "missing_email",
        amount: body.sale_gross || "0",
        status: "success",
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection("paddle_payments").add(paymentData);
      console.log("✅ Firestore document created:", docRef.id);
    } else {
      console.log("ℹ️ Not a payment_succeeded alert:", body.alert_name);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ FULL ERROR TRACE:", error);
    return res.status(500).json({ error: error.message });
  }
}
