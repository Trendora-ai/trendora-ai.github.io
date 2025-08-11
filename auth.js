import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7ehbN_SlpBz14zuZ4Etok31vdw1XmGOQ",
    authDomain: "trendora-auth.firebaseapp.com",
    projectId: "trendora-auth",
    storageBucket: "trendora-auth.firebasestorage.app",
    messagingSenderId: "169775124553",
    appId: "1:169775124553:web:0d06cccd6dd110c72aef98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Form toggle
let isSignup = true;
document.getElementById("toggle-link").addEventListener("click", function(e) {
    e.preventDefault();
    isSignup = !isSignup;
    document.getElementById("form-title").innerText = isSignup ? "Signup" : "Login";
    document.getElementById("submitBtn").innerText = isSignup ? "Signup" : "Login";
    document.getElementById("toggle-text").innerHTML = isSignup 
        ? `Already have an account? <a href="#" id="toggle-link">Login here</a>` 
        : `Don't have an account? <a href="#" id="toggle-link">Signup here</a>`;
});

// Submit button click
document.getElementById("submitBtn").addEventListener("click", function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageEl = document.getElementById("message");

    if (!email || !password) {
        messageEl.innerText = "Please fill in all fields.";
        return;
    }

    if (isSignup) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                messageEl.style.color = "green";
                messageEl.innerText = "Signup successful! Redirecting...";
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            })
            .catch(err => {
                messageEl.style.color = "red";
                messageEl.innerText = err.message;
            });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                messageEl.style.color = "green";
                messageEl.innerText = "Login successful! Redirecting...";
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            })
            .catch(err => {
                messageEl.style.color = "red";
                messageEl.innerText = err.message;
            });
    }
});
