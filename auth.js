import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Signup
const signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
  signupBtn.addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        document.getElementById('signup-message').innerText = "Account created successfully! Redirecting...";
        setTimeout(() => window.location.href = "login.html", 1500);
      })
      .catch(err => {
        document.getElementById('signup-message').innerText = err.message;
      });
  });
}

// Login
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "dashboard.html";
      })
      .catch(err => {
        document.getElementById('login-message').innerText = err.message;
      });
  });
}
