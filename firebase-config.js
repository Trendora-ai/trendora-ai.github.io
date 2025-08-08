// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
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
export const auth = getAuth(app);
