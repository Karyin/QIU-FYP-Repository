// ✅ Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref as dbRef, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  databaseURL: "https://fyp-database-2172a-default-rtdb.firebaseio.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.appspot.com",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};

// ✅ Firebase Initialization
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

// 🔐 Authentication Check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
    return;
  }

  const matric = user.email.split('@')[0].toUpperCase();
  document.querySelector('.username').textContent = `${matric} \u25BE`;
  document.querySelector('.avatar').textContent = matric.charAt(0);

  loadAllSubmissions(matric);
});

// 📋 Load Student's Submissions & Feedback
function loadAllSubmissions(matric) {
  const reportList = document.getElementById("report-list");
  const submissionsRef = dbRef(database, `submissions/${matric}`);

  onValue(submissionsRef, (snapshot) => {
    reportList.innerHTML = "";

    if (!snapshot.exists()) {
      reportList.innerHTML = "<p>No reports submitted yet.</p>";
      return;
    }

    let hasValid = false;

    snapshot.forEach((reportSnap) => {
      const data = reportSnap.val();
      if (!data || !data.title || !data.timestamp || !data.pdfUrls || data.pdfUrls.length === 0) return;

      hasValid = true;
      const title = data.title.trim();
      const submittedAt = new Date(data.timestamp).toLocaleString("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });

      const academicScore = data.scores?.academic?.score ?? "-";
      const academicFeedback = data.scores?.academic?.feedback || "Pending review...";
      const industryScore = data.scores?.industry?.score ?? "-";
      const industryFeedback = data.scores?.industry?.feedback || "Pending review...";

      const fileLinks = data.pdfUrls.map(url => `<a href="${url}" target="_blank">View File</a>`).join("<br>");

      reportList.innerHTML += `
        <div class="report-card" data-title="${title.toLowerCase()}">
          <h3>${title}</h3>
          <p><strong>Submitted on:</strong> ${submittedAt}</p>

          <div class="feedback">
            <h4>Academic Supervisor Feedback</h4>
            <p><strong>Score:</strong> ${academicScore}</p>
            <p>${academicFeedback}</p>
          </div>

          <div class="feedback">
            <h4>Industry Supervisor Feedback</h4>
            <p><strong>Score:</strong> ${industryScore}</p>
            <p>${industryFeedback}</p>
          </div>

          <div><strong>Files:</strong><br>${fileLinks}</div>
        </div>
      `;
    });

    if (!hasValid) {
      reportList.innerHTML = "<p>No valid reports submitted yet.</p>";
    }
  });
}

// 🔍 Search Filter
window.searchReports = function () {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".report-card");
  cards.forEach(card => {
    const title = card.getAttribute("data-title") || "";
    card.style.display = title.includes(input) ? "block" : "none";
  });
};

// 🔓 Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// 💬 Optional Popup Toggles (Contact, WhatsApp)
const toggleBtn = document.getElementById("contact-toggle");
const contactPopup = document.getElementById("contact-popup");
if (toggleBtn && contactPopup) {
  toggleBtn.addEventListener("click", () => {
    contactPopup.style.display = contactPopup.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => {
    if (!toggleBtn.contains(e.target) && !contactPopup.contains(e.target)) {
      contactPopup.style.display = "none";
    }
  });
}

const chatIcon = document.getElementById("chat-icon");
const popup = document.getElementById("whatsapp-popup");
const openWhatsappBtn = document.getElementById("open-whatsapp");

if (chatIcon && popup) {
  chatIcon.addEventListener("click", () => {
    popup.style.display = popup.style.display === "block" ? "none" : "block";
  });
}
if (openWhatsappBtn) {
  openWhatsappBtn.addEventListener("click", () => {
    window.open("https://wa.me/601158808424", "_blank");
  });
}
document.addEventListener("click", (e) => {
  if (popup && !popup.contains(e.target) && e.target !== chatIcon) {
    popup.style.display = "none";
  }
});