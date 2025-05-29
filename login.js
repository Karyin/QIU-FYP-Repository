// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Your Firebase configuration (from your project)
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

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("submit");

  loginButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // Get input values
    const matricNumber = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!matricNumber || !password) {
      alert("Please enter both Matric Number and Password.");
      return;
    }

    const firstLetter = matricNumber.charAt(0).toUpperCase();
    const pseudoEmail = `${matricNumber}@example.com`;

    try {
      // Authenticate using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, password);
      const user = userCredential.user;

      // Determine role and redirect
      if (firstLetter === "Q") {
        alert("Login successful. Redirecting to student dashboard...");
        window.location.href = "student.html";
      } else if (firstLetter === "A") {
        alert("Login successful. Redirecting to supervisor dashboard...");
        window.location.href = "supervisor.html";
      } else if (firstLetter === "S") {
        alert("Login successful. Redirecting to industry supervisor dashboard...");
        window.location.href = "industry.html";
      } else {
        alert("Invalid Matric Number format. It must start with Q, A, or S.");
      }

    } catch (error) {
      console.error("Login error:", error.message);
      alert(`Login failed: ${error.message}`);
    }
  });
});




