// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to show custom alert
function showAlert(message, type = "success") {
  let alertBox = document.createElement("div");
  alertBox.className =
    `fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-opacity duration-300 
    ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
  alertBox.innerText = message;
  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => alertBox.remove(), 300);
  }, 3000);
}

// Signup
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showAlert("Account created successfully!", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } catch (error) {
      showAlert(error.message, "error");
    }
  });
}

// Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert("Login successful!", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } catch (error) {
      showAlert(error.message, "error");
    }
  });
}

// Forgot Password
const forgotForm = document.getElementById("forgot-form");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value;

    try {
      await sendPasswordResetEmail(auth, email);
      showAlert("Password reset email sent!", "success");
    } catch (error) {
      showAlert(error.message, "error");
    }
  });
}
