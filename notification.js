<!-- Firebase SDKs -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

  // ✅ Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
    authDomain: "trendora-auth.firebaseapp.com",
    projectId: "trendora-auth",
    storageBucket: "trendora-auth.appspot.com",
    messagingSenderId: "169775124553",
    appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // ✅ Toast Notification
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

  // ✅ Firestore Notification (Dashboard ke liye)
  export async function addNotification(title, message) {
    try {
      await addDoc(collection(db, "Notifications"), {
        title: title,
        message: message,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding notification: ", e);
    }
  }
</script>
