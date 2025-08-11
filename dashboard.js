// src/dashboard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Agar user login nahi hai → login page bhejo
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
