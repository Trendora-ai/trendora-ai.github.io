import * as admin from "firebase-admin";

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    console.log("🔥 Firebase Config:", {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyExists: !!privateKey,
    });

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
} catch (initError) {
  console.error("❌ Firebase init error:", initError);
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("🟢 Webhook Body:", req.body);

    if (req.body.alert_name === "subscription_payment_succeeded") {
      await db.collection("paddle_payments").add({
        email: req.body.email,
        subscription_id: req.body.subscription_id,
        amount: req.body.sale_gross,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ Payment saved for:", req.body.email);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
