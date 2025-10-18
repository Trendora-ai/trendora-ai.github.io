import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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
    bodyParser: false,
  },
};

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
    console.log("🔔 Paddle Body:", body);

    if (body.alert_name === "subscription_payment_succeeded") {
      const paymentData = {
        subscription_id: body.subscription_id || "unknown",
        email: body.email || "unknown",
        amount: body.sale_gross || "0",
        status: "success",
        createdAt: new Date().toISOString(),
      };

      await db.collection("paddle_payments").add(paymentData);
      console.log("✅ Payment saved to Firestore");
    } else {
      console.log("ℹ️ Ignored alert:", body.alert_name);
    }

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
