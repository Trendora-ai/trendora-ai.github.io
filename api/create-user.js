// api/create-user.js
import admin from "firebase-admin";

// Prevent double init
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
    console.log("🔥 Firebase initialized successfully (create-user)");
  } catch (err) {
    console.error("❌ Firebase init error (create-user):", err);
  }
}

const db = admin.firestore();

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    const freePlanId = process.env.FREE_PLAN_ID || "free"; // optional
    const doc = {
      email,
      name: name || null,
      plan: {
        id: freePlanId,
        name: "Free",
      },
      status: "active",
      subscription_id: null,
      next_bill_date: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(email).set(doc, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ create-user error:", err);
    return res.status(500).json({ error: err.message });
  }
      }
