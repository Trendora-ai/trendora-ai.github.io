// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } 
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
  authDomain: "trendora-auth.firebaseapp.com",
  projectId: "trendora-auth",
  storageBucket: "trendora-auth.firebasestorage.app",
  messagingSenderId: "169775124553",
  appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Signup
window.signup = function() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created successfully!");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// Login
window.login = function() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// Forgot Password
window.forgotPassword = function() {
  const email = document.getElementById("loginEmail").value;
  if (!email) {
    alert("Please enter your email first.");
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
};
