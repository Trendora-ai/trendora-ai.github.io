import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // ✅ Signup successful
            alert("Signup successful! Redirecting to login...");
            window.location.href = "login.html"; // Redirect to login page
        })
        .catch((error) => {
            alert(error.message);
        });
});
