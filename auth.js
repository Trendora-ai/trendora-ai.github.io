// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Message Function
function showMessage(msg, type = "success") {
  const alertBox = document.getElementById("alert-box");
  if (!alertBox) return;
  alertBox.textContent = msg;
  alertBox.className = type === "success"
    ? "mb-4 p-3 rounded bg-green-100 text-green-800 text-center"
    : "mb-4 p-3 rounded bg-red-100 text-red-800 text-center";
  alertBox.style.display = "block";
}

// SIGNUP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        showMessage("Account created successfully!", "success");
        setTimeout(() => window.location.href = "dashboard.html", 1000);
      })
      .catch((error) => showMessage(error.message, "error"));
  });
}

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        showMessage("Login successful!", "success");
        setTimeout(() => window.location.href = "dashboard.html", 1000);
      })
      .catch((error) => showMessage(error.message, "error"));
  });
}

// FORGOT PASSWORD
const forgotForm = document.getElementById("forgot-form");
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value;

    sendPasswordResetEmail(auth, email)
      .then(() => showMessage("Password reset email sent!", "success"))
      .catch((error) => showMessage(error.message, "error"));
  });
}
