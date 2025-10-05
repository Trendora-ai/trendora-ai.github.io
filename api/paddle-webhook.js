import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
  authDomain: "trendora-auth.firebaseapp.com",
  projectId: "trendora-auth",
  storageBucket: "trendora-auth.appspot.com",
  messagingSenderId: "169775124553",
  appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔔 Main Webhook Function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const event = req.body;
    console.log("🔔 Paddle Webhook Received:", event);

    const alert = event.alert_name;
    const userEmail = event.email;
    const subscriptionId = event.subscription_id;

    // ✅ Handle different events
    if (alert === "subscription_created") {
      await handleSubscriptionUpdate(userEmail, "pro", "Subscription started");
    } 
    else if (alert === "subscription_payment_succeeded") {
      await handleSubscriptionUpdate(userEmail, "pro", "Payment received successfully");
    } 
    else if (alert === "subscription_cancelled") {
      await handleSubscriptionUpdate(userEmail, "free", "Subscription cancelled");
    } 
    else if (alert === "subscription_payment_failed") {
      await handleSubscriptionUpdate(userEmail, "free", "Payment failed — downgraded to free plan");
    } 
    else if (alert === "subscription_expired") {
      await handleSubscriptionUpdate(userEmail, "free", "Subscription expired");
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// 🔹 Update user plan + notification
async function handleSubscriptionUpdate(email, plan, message) {
  try {
    const userRef = doc(db, "Users", email);
    await setDoc(userRef, {
      plan,
      updatedAt: serverTimestamp(),
      lastMessage: message,
    }, { merge: true });

    // Add notification to Firestore
    const notifRef = doc(db, "Notifications", `${email}-${Date.now()}`);
    await setDoc(notifRef, {
      userId: email,
      title: "💳 Subscription Update",
      message,
      read: false,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ User ${email} updated to plan: ${plan}`);
  } catch (err) {
    console.error("⚠️ Firestore update failed:", err);
  }
      }
