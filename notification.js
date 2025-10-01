// notification.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// ================== Firebase Config ==================
const firebaseConfig = {
  apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
  authDomain: "trendora-auth.firebaseapp.com",
  projectId: "trendora-auth",
  storageBucket: "trendora-auth.appspot.com",
  messagingSenderId: "169775124553",
  appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================== Toast ==================
export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toast-title");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  if (type === "success") {
    toastTitle.textContent = "🎉 Success!";
    toastMessage.textContent = message;
    toastIcon.textContent = "✅";
    toastIcon.className = "flex-shrink-0 bg-green-100 text-green-600 p-2 rounded-full";
  } else {
    toastTitle.textContent = "⚠️ Error";
    toastMessage.textContent = message;
    toastIcon.textContent = "❌";
    toastIcon.className = "flex-shrink-0 bg-red-100 text-red-600 p-2 rounded-full";
  }

  toast.classList.remove("hidden", "opacity-0", "-translate-y-5");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-5");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3000);
}

// ================== Add Notification ==================
export async function addNotification(userId, title, message) {
  try {
    await addDoc(collection(db, "Notifications"), {
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification:", error);
  }
}

// ================== Live Notification Listener ==================
export function listenNotifications(userId) {
  const q = query(collection(db, "Notifications"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const notifList = document.getElementById("notification-list");
    const notifCount = document.getElementById("notification-count");
    if (!notifList || !notifCount) return;

    notifList.innerHTML = "";
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        count++;
        const li = document.createElement("li");
        li.className = `p-3 border-b ${data.read ? "bg-white" : "bg-blue-50 font-semibold"}`;
        li.textContent = `${data.title} - ${data.message}`;
        notifList.appendChild(li);
      }
    });

    // 🔔 Update badge
    if (count > 0) {
      notifCount.textContent = count;
      notifCount.classList.remove("hidden");
    } else {
      notifCount.classList.add("hidden");
    }
  });
}

// ================== Auto-Add Functions ==================

// 1. Plan / Subscription
export function notifySubscription(userId, type = "start") {
  if (type === "start") {
    addNotification(userId, "🎉 Subscription Active", "Your premium subscription has started!");
  } else if (type === "renewal_fail") {
    addNotification(userId, "⚠️ Payment Failed", "Please update your payment details.");
  } else if (type === "expiring") {
    addNotification(userId, "⏳ Expiring Soon", "Your subscription will expire in 3 days.");
  } else if (type === "expired") {
    addNotification(userId, "❌ Subscription Ended", "Please renew to continue using premium features.");
  }
}

// 2. Product / Sales
export function notifyProduct(userId, productName) {
  addNotification(userId, "🛍️ New Product", `A new product '${productName}' has been added!`);
}

export function notifySale(userId, saleCount) {
  addNotification(userId, "💰 Sales Update", `You have ${saleCount} new sales today!`);
}

// 3. Feature Updates
export function notifyFeature(userId, featureName) {
  addNotification(userId, "✨ New Feature", `${featureName} is now live on your dashboard!`);
}

// 4. User Activity
export function notifyActivity(userId, activity) {
  addNotification(userId, "👤 User Activity", `${activity}`);
}

// ================== Init ==================
auth.onAuthStateChanged((user) => {
  if (user) {
    listenNotifications(user.uid);
  }
});
