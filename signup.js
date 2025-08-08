import { app } from "./firebase-config.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  if (!email || !password) {
    message.textContent = "Please fill in all fields.";
    message.style.color = "red";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    message.textContent = "Account created successfully!";
    message.style.color = "green";
    console.log("User:", userCredential.user);
  } catch (error) {
    message.textContent = error.message;
    message.style.color = "red";
  }
});
