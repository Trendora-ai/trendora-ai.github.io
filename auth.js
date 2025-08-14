// --- Firebase (v10 modular, CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your (already shared) Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
  authDomain: "trendora-auth.firebaseapp.com",
  projectId: "trendora-auth",
  storageBucket: "trendora-auth.firebasestorage.app",
  messagingSenderId: "169775124553",
  appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- UI Helpers ---
function showMessage(text, type = "success") {
  const box = document.getElementById("message-box");
  if (!box) return;

  box.textContent = text;
  // base classes
  box.className =
    "mt-4 text-sm rounded-lg p-3 " +
    (type === "success"
      ? "bg-green-100 text-green-800 border border-green-300"
      : "bg-red-100 text-red-800 border border-red-300");
  box.classList.remove("hidden");

  // auto-hide after a while (forgot page keeps it)
  if (document.getElementById("forgot-form")) return;
  setTimeout(() => box.classList.add("hidden"), 3000);
}

// --- SIGNUP (redirect to login) ---
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage("Account created! Redirecting to login…", "success");
      setTimeout(() => (window.location.href = "login.html"), 1000);
    } catch (err) {
      showMessage(err.message || "Signup failed.", "error");
    }
  });
}

// --- LOGIN (redirect to dashboard) ---
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Login successful! Redirecting…", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } catch (err) {
      showMessage(err.message || "Login failed.", "error");
    }
  });
}

// --- FORGOT PASSWORD (no redirect) ---
const forgotForm = document.getElementById("forgot-form");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("Password reset email sent! Check your inbox.", "success");
    } catch (err) {
      showMessage(err.message || "Could not send reset email.", "error");
    }
  });
}
