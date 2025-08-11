// src/dashboard.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Agar login nahi hai → login page bhejo
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
