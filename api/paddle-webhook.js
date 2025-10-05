import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("🔔 Paddle Webhook Received:", req.body);

    const body = req.body;

    if (body.alert_name === "subscription_payment_succeeded") {
      const paymentData = {
        subscription_id: body.subscription_id,
        email: body.email,
        amount: body.sale_gross,
        status: "success",
        createdAt: new Date(),
      };

      await db.collection("paddle_payments").add(paymentData);

      console.log("✅ Payment stored for:", body.email);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}
