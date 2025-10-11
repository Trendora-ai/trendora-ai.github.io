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
    bodyParser: false, // Disable default body parser for raw body
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    console.log("🧾 RAW BODY:", rawBody);

    // If no body received
    if (!rawBody) {
      return res.status(400).json({ error: "Empty body received" });
    }

    // Decode Paddle x-www-form-urlencoded
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());
    console.log("🔔 Parsed Paddle Body:", body);

    // Handle successful payments
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

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}
