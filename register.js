// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.firebasestorage.app",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Register logic
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const matricNumber = document.getElementById("matric-number").value.trim();
    const password = document.getElementById("password").value;

    const firstLetter = matricNumber.charAt(0).toUpperCase();

    if (!matricNumber || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!["Q", "A", "S"].includes(firstLetter)) {
      alert("Matric number must start with Q (Student), A (Supervisor), or S (Industry Supervisor).");
      return;
    }

    const pseudoEmail = `${matricNumber}@example.com`;

    try {
      await createUserWithEmailAndPassword(auth, pseudoEmail, password);
      alert("Account created successfully!");
      window.location.href = "Login.html";
    } catch (error) {
      console.error("Registration error:", error.message);
      alert("Registration failed: " + error.message);
    }
  });
});
