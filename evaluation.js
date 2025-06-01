import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  databaseURL: "https://fyp-database-2172a-default-rtdb.firebaseio.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.appspot.com",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication check and UI update
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
  } else {
    const email = user.email.toUpperCase();
    const id = email.split('@')[0];
    const usernameEl = document.querySelector(".username");
    const avatarEl = document.querySelector(".avatar");

    if (usernameEl) usernameEl.textContent = `${id} ▾`;
    if (avatarEl) avatarEl.textContent = id.charAt(0).toUpperCase();
  }
});

// Logout button functionality
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch(err => {
      console.error("Logout error:", err);
      alert("Logout failed. Please try again.");
    });
  });
}

// Get form and elements
const form = document.getElementById("evalForm");
const totalDisplay = document.getElementById("totalDisplay");
const statusMsg = document.getElementById("statusMsg");

// Get selected value of a radio group
function getRadioValue(name) {
  const radios = document.getElementsByName(name);
  for (const radio of radios) {
    if (radio.checked) return parseInt(radio.value);
  }
  return 0;
}

//Calculate total score
function calculateTotal() {
  let total = 0;
  for (let i = 1; i <= 17; i++) {
    total += getRadioValue(`q${i}`);
  }
  return total;
}


// Real-time total score update 
document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const total = calculateTotal();
    totalDisplay.textContent = `${total}/85`; 
  });
});



//Submit evaluation form to Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const matric = document.getElementById("matric").value.trim();
  if (!matric) {
    alert("Please enter the Student Matric ID.");
    return;
  }

  const scores = {
    cognitiveSkills: getRadioValue("q1"),
    practicalSkills: getRadioValue("q2"),
    digitalSkills: getRadioValue("q3"),
    numeracySkills: getRadioValue("q4"),
    entrepreneurialSkills: getRadioValue("q5"),
    leadershipSkills: getRadioValue("q6"),
    interpersonalSkills: getRadioValue("q7"),
    writtenCommunication: getRadioValue("q8"),
    oralCommunication: getRadioValue("q9"),
    resilience: getRadioValue("q10"),
    growthMindset: getRadioValue("q11"),
    competitiveSpirit: getRadioValue("q12"),
    proactive: getRadioValue("q13"),
    ethicalProfessional: getRadioValue("q14"),
    socialResponsibility: getRadioValue("q15"),
    etiquette: getRadioValue("q16"),
    personalSkills: getRadioValue("q17")
  };

  const totalScore = calculateTotal();

  const data = {
    ...scores,
    totalScore: `${totalScore}/85`,
    timestamp: serverTimestamp(),
    matricID: matric
  };

  try {
    await setDoc(doc(db, "industryEvaluations", matric), data);
    statusMsg.textContent = "✅ Evaluation submitted successfully.";
    statusMsg.style.color = "green";
    form.reset();
    totalDisplay.textContent = "0/85";
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    statusMsg.textContent = "❌ Failed to submit evaluation. Please try again.";
    statusMsg.style.color = "red";
  }
});
