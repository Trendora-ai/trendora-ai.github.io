import admin from "firebase-admin";

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

export const config = {
  api: {
    bodyParser: false, // Important: disable default body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 🔹 Read the raw request body (Paddle sends form-data, not JSON)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    console.log("🧾 RAW BODY:", rawBody);

    // 🔹 Convert URL-encoded body to JS object
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());
    console.log("🔔 Parsed Paddle Body:", body);

    // 🔹 Check for successful payment alert
    if (body.alert_name === "subscription_payment_succeeded") {
      const paymentData = {
        subscription_id: body.subscription_id || "unknown",
        email: body.email || "unknown",
        amount: body.sale_gross || "0",
        status: "success",
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection("paddle_payments").add(paymentData);
      console.log("✅ Firestore doc added with ID:", docRef.id);
    } else {
      console.log("ℹ️ Ignored alert:", body.alert_name);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}
