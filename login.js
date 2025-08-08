import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

loginBtn.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful!";
            // Redirect after login
            setTimeout(() => {
                window.location.href = "dashboard.html"; // apni dashboard file ka naam lagao
            }, 1000);
        })
        .catch((error) => {
            loginMessage.style.color = "red";
            loginMessage.textContent = error.message;
        });
});
