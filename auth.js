// auth.js (module)
// Expects ./firebase-config.js to export `auth` (modular SDK)
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

/* Redirect already-logged-in user away from auth pages */
onAuthStateChanged(auth, (user) => {
  if (user) {
    // if on signup or login page, send to dashboard
    if (location.pathname.endsWith("signup.html") || location.pathname.endsWith("login.html") || location.pathname === "/" ) {
      window.location.href = "dashboard.html";
    }
  }
});

/* Utility to show messages */
function showMessage(id, text, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (type === "success" ? "success" : "error");
  // auto clear after 5s
  setTimeout(() => { el.textContent = ""; el.className = "msg"; }, 5000);
}

/* Basic validation */
function isValidEmail(email){
  return /\S+@\S+\.\S+/.test(email);
}
function isStrongPassword(pw){
  return pw && pw.length >= 6; // Firebase min 6
}

/* SIGNUP */
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (document.getElementById("signup-name")?.value || "").trim();
    const email = (document.getElementById("signup-email")?.value || "").trim();
    const password = (document.getElementById("signup-password")?.value || "");

    if (!email || !password) return showMessage("signup-msg", "Please fill all fields.");
    if (!isValidEmail(email)) return showMessage("signup-msg", "Enter a valid email.");
    if (!isStrongPassword(password)) return showMessage("signup-msg", "Password must be at least 6 characters.");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage("signup-msg", "Account created. Redirecting...", "success");
      setTimeout(() => window.location.href = "dashboard.html", 900);
    } catch (err) {
      // show firebase error message in friendly form
      showMessage("signup-msg", err.message || "Signup failed.");
    }
  });
}

/* LOGIN */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("login-email")?.value || "").trim();
    const password = (document.getElementById("login-password")?.value || "");

    if (!email || !password) return showMessage("login-msg", "Please fill all fields.");
    if (!isValidEmail(email)) return showMessage("login-msg", "Enter a valid email.");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("login-msg", "Login successful. Redirecting...", "success");
      setTimeout(() => window.location.href = "dashboard.html", 600);
    } catch (err) {
      showMessage("login-msg", "Invalid email or password.");
    }
  });
}

/* OPTIONAL: forgot password link handling (if present) */
const forgot = document.getElementById("forgot-link");
if (forgot) {
  forgot.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt("Enter your account email to receive reset link:");
    if (!email) return;
    if (!isValidEmail(email)) return alert("Enter a valid email.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      alert(err.message || "Could not send reset email.");
    }
  });
        }
