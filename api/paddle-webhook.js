import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    console.log("🔔 Paddle Webhook Received:", body);

    if (body.alert_name === "subscription_payment_succeeded") {
      const subscriptionId = body.subscription_id;
      const email = body.email;

      await db.collection("paddle_payments").add({
        subscription_id: subscriptionId,
        email: email,
        amount: body.sale_gross,
        status: "success",
        createdAt: new Date(),
      });

      console.log("✅ Payment stored in Firestore for:", email);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
