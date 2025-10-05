import * as admin from "firebase-admin";

if (!admin.apps.length) {
  // Initialize Firebase Admin SDK
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error("❌ Missing Firebase environment variables");
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    console.log("🔔 Paddle Webhook Received:", body);

    // Handle successful subscription payment
    if (body.alert_name === "subscription_payment_succeeded") {
      const subscriptionId = body.subscription_id;
      const email = body.email;

      await db.collection("paddle_payments").add({
        subscription_id: subscriptionId,
        email: email || "unknown",
        amount: body.sale_gross || 0,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Payment stored in Firestore for:", email);
    }

    // Respond to Paddle
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}

// Optional: Disable body parsing so Paddle raw body can be verified later if needed
export const config = {
  api: {
    bodyParser: true,
  },
};
