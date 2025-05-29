import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  databaseURL: "https://fyp-database-2172a-default-rtdb.firebaseio.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.appspot.com",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// ✅ DOM
const reportList = document.getElementById("report-list");
const statusFilter = document.getElementById("status-filter");
const searchInput = document.getElementById("searchInput");

// ✅ Auth listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
    return;
  }
  document.querySelector(".username").textContent = `${user.email.split('@')[0].toUpperCase()} ▾`;
  document.querySelector(".avatar").textContent = user.email.charAt(0).toUpperCase();
  loadReports();
});

// ✅ Load Reports
function loadReports() {
  const submissionsRef = dbRef(db, 'submissions');
  onValue(submissionsRef, (snapshot) => {
    reportList.innerHTML = "";
    snapshot.forEach(studentSnap => {
      const matric = studentSnap.key;
      studentSnap.forEach(reportSnap => {
        const report = reportSnap.val();
        const key = reportSnap.key;
        if (!report || !report.title) return;

        const title = report.title;
        const subject = report.subject || "-";
        const timestamp = new Date(report.timestamp).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });

        const industry = report.scores?.industry;
        const score = industry?.score || "";
        const feedback = industry?.feedback || "";

        const summaryText = report.summary || "<i>No summary provided.</i>";
        const fileLinks = (report.pdfUrls || []).map(url =>
          `<a href="${url}" target="_blank" style="color:blue;">📄 View</a>`
        ).join(" | ");

        const card = document.createElement("div");
        card.className = "report-card";
        card.setAttribute("data-title", title.toLowerCase());
        card.setAttribute("data-matric", matric.toLowerCase());
        card.setAttribute("data-score", score || ""); 
        card.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Matric:</strong> ${matric} | <strong>Subject:</strong> ${subject}</p>
          <p><strong>Submitted:</strong> ${timestamp}</p>
          <div><strong>Files:</strong> ${fileLinks}</div>
            <div><strong>Student Summary:</strong> ${summaryText}</div>

          <div class="review-inputs">
            <label>Industry Score:</label>
            <input type="number" min="0" max="100" id="score-${matric}-${key}" value="${score}" />
            <label>Industry Feedback:</label>
            <textarea id="feedback-${matric}-${key}">${feedback}</textarea>
          </div>

          <div class="button-group">
            <button onclick="save('${matric}', '${key}')">💾 Save</button>
          </div>
        `;
        reportList.appendChild(card);
      });
    });
  });
}

// ✅ Save Function (只保存 industry 的部分)
window.save = function (matric, key) {
  const scoreInput = document.getElementById(`score-${matric}-${key}`);
  const feedbackInput = document.getElementById(`feedback-${matric}-${key}`);
  const score = parseInt(scoreInput.value.trim());
  const feedback = feedbackInput.value.trim();

  const reportRef = dbRef(db, `submissions/${matric}/${key}`);
  update(reportRef, {
    "scores/industry/score": score,
    "scores/industry/feedback": feedback
  })
    .then(() => alert("Industry feedback saved!"))
    .catch((err) => alert("Failed to save: " + err.message));
};

// ✅ Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
  });
};

statusFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

function applyFilters() {
  const status = statusFilter.value;
  const search = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll(".report-card");
  cards.forEach(card => {
    const rawScore = card.getAttribute("data-score");
    const parsedScore = parseInt(rawScore);
    const actualStatus = !isNaN(parsedScore) ? "Reviewed" : "Pending";

    const title = card.getAttribute("data-title");
    const matric = card.getAttribute("data-matric");

    const matchStatus = status === "all" || status === actualStatus;
    const matchSearch = title.includes(search) || matric.includes(search);
    card.style.display = matchStatus && matchSearch ? "block" : "none";
  });
}