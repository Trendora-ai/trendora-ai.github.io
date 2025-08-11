// Firebase SDK import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
  authDomain: "trendora-auth.firebaseapp.com",
  projectId: "trendora-auth",
  storageBucket: "trendora-auth.firebasestorage.app",
  messagingSenderId: "169775124553",
  appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let isSignup = true;

document.getElementById("auth-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (isSignup) {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => alert("Signup successful!"))
      .catch(err => alert(err.message));
  } else {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => alert("Login successful!"))
      .catch(err => alert(err.message));
  }
});

window.toggleForm = function () {
  isSignup = !isSignup;
  document.getElementById("form-title").textContent = isSignup ? "Signup" : "Login";
  document.getElementById("auth-btn").textContent = isSignup ? "Signup" : "Login";
  document.getElementById("switch").innerHTML = isSignup
    ? 'Already have an account? <span onclick="toggleForm()">Login</span>'
    : 'Don\'t have an account? <span onclick="toggleForm()">Signup</span>';
};

window.forgotPassword = function () {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Enter your email to reset password");
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
};
