// src/signup.js
import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// If already logged-in → dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name")?.value?.trim() || null;

  if (!email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);

    // Call server to create Firestore doc
    try {
      await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch (err) {
      console.warn("⚠️ create-user API failed:", err);
      // continue — user is created in Auth and webhook will handle plan changes too
    }

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
});
