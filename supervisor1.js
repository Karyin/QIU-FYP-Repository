import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ✅ Firebase Config
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
const auth = getAuth(app);

// ✅ 显示用户 Email & 头像（大写）
// --- Auth State Change Listener ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "Login.html";
  } else {
    const email = user.email.toUpperCase();
    const id = email.split('@')[0];
    const usernameEl = document.querySelector(".username");
    const avatarEl = document.querySelector(".avatar, .avatar-large");
    if (usernameEl) usernameEl.textContent = `${id} ▾`;
    if (avatarEl) avatarEl.textContent = id.charAt(0).toUpperCase();
  }
});
  

// ✅ DOM References
const recentList = document.getElementById("recent-list");
const totalEl = document.getElementById("total-reports");
const pendingEl = document.getElementById("pending-reports");
const reviewedEl = document.getElementById("reviewed-reports");

let total = 0, pending = 0, reviewed = 0;

const submissionsRef = dbRef(db, 'submissions');

onValue(submissionsRef, (snapshot) => {
  recentList.innerHTML = '';
  total = pending = reviewed = 0;

  snapshot.forEach(studentSnap => {
    const matric = studentSnap.key;
    studentSnap.forEach(reportSnap => {
      const report = reportSnap.val();
      if (!report || !report.title) return;

      total++;

      // ✅ 判断 supervisor 的评分状态（只判断 academic）
      const academic = report.scores?.academic;
      const rawScore = academic?.score;
      const score = typeof rawScore === "string" ? parseInt(rawScore) : rawScore;
      const isReviewed = typeof score === "number" && !isNaN(score);

      const status = isReviewed ? "Reviewed" : "Pending";
      if (isReviewed) reviewed++;
      else pending++;

      const title = report.title;
      const subject = report.subject || "-";
      const timestamp = new Date(report.timestamp).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });

      const fileLinks = (report.pdfUrls || []).map(url =>
        `<a href="${url}" target="_blank" style="color:blue;">📄 View</a>`
      ).join(" | ");

      const tagClass = isReviewed ? "green" : "orange";

      const card = document.createElement("div");
      card.className = "report-card";
      card.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Matric:</strong> ${matric} | <strong>Subject:</strong> ${subject}</p>
        <p><strong>Submitted:</strong> ${timestamp}</p>
        <p><strong>Status:</strong> <span class="status-tag ${tagClass}">${status}</span></p>
        <div><strong>Files:</strong> ${fileLinks}</div>
        <p><strong>Student Summary:</strong> ${report.summary || "<i>No summary provided.</i>"}</p>
        <div style="margin-top: 10px;">
          <button onclick="window.location.href='managereport.html?matric=${matric}&reportId=${reportSnap.key}'">
            ➤ Review / Feedback
          </button>
        </div>
      `;

      recentList.appendChild(card);
    });
  });

  totalEl.textContent = total;
  pendingEl.textContent = pending;
  reviewedEl.textContent = reviewed;
});

// ✅ 登出按钮功能
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

const reportRef = dbRef(db, `submissions/${matric}/${reportId}`);
onValue(reportRef, (snapshot) => {
  const report = snapshot.val();
  if (report && report.summary) {
    document.getElementById("student-summary").textContent = report.summary;
  } else {
    document.getElementById("student-summary").textContent = "No summary provided.";
  }
});

