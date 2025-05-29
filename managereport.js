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

const reportList = document.getElementById("report-list");
const statusFilter = document.getElementById("status-filter");
const searchInput = document.getElementById("searchInput");

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

        const academic = report.scores?.academic || {};
        const rawScore = academic.score;
        const parsedScore = typeof rawScore === "string" ? parseInt(rawScore) : rawScore;
        const isReviewed = typeof parsedScore === "number" && !isNaN(parsedScore);

        const status = isReviewed ? "Reviewed" : "Pending";
        const tagClass = isReviewed ? "green" : "orange";

        const title = report.title;
        const subject = report.subject || "-";
        const timestamp = new Date(report.timestamp).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });

        const fileLinks = (report.pdfUrls || []).map(url =>
          `<a href="${url}" target="_blank" style="color:blue;">📄 View</a>`
        ).join(" | ");

        const card = document.createElement("div");
        card.className = "report-card";
        card.setAttribute("data-title", title.toLowerCase());
        card.setAttribute("data-matric", matric.toLowerCase());
        card.setAttribute("data-score", rawScore || ""); // 用于筛选
        card.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Matric:</strong> ${matric} | <strong>Subject:</strong> ${subject}</p>
          <p><strong>Submitted:</strong> ${timestamp}</p>
          <p><strong>Status:</strong> <span class="status-tag ${tagClass}">${status}</span></p>
          <div><strong>Files:</strong> ${fileLinks}</div>
          <p><strong>Student Summary:</strong> ${report.summary || "<i>No summary provided.</i>"}</p>

          </div>

          <div class="review-inputs">
            <label>Academic Score:</label>
            <input type="number" min="0" max="100" id="score-${matric}-${key}" placeholder="Academic Score" value="${academic.score || ''}" />
            <label>Academic Feedback:</label>
            <textarea id="feedback-${matric}-${key}" placeholder="Academic feedback...">${academic.feedback || ''}</textarea>
          </div>

          <div class="button-group">
            <button onclick="save('${matric}', '${key}')">💾 Save</button>
          </div>
        `;
        reportList.appendChild(card);
      });
    });
    applyFilters();
  });
}

window.save = function (matric, key) {
  const scoreInput = document.getElementById(`score-${matric}-${key}`);
  const feedbackInput = document.getElementById(`feedback-${matric}-${key}`);
  const score = parseInt(scoreInput.value.trim());
  const feedback = feedbackInput.value.trim();

  const reportRef = dbRef(db, `submissions/${matric}/${key}`);
  update(reportRef, {
    scores: {
      academic: {
        score: score,
        feedback: feedback
      }
    }
  })
    .then(() => alert("Saved successfully!"))
    .catch((err) => alert("Failed to save: " + err.message));
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

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
  });
}

const reportRef = dbRef(db, `submissions/${matric}/${reportId}`);
onValue(reportRef, (snapshot) => {
  const report = snapshot.val();
  if (report.summary) {
    document.getElementById("student-summary").textContent = report.summary;
  } else {
    document.getElementById("student-summary").textContent = "No summary provided.";
  }
});
