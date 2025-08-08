import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // ✅ Login successful
            alert("Login successful! Redirecting to dashboard...");
            window.location.href = "dashboard.html"; // Redirect to dashboard page
        })
        .catch((error) => {
            alert(error.message);
        });
});
