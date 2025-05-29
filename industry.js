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

// ✅ Firebase 配置
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

// ✅ 登录验证 + 显示头像首字母（隐藏 email）
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
  } else {
    const email = user.email.toUpperCase();
    const id = email.split('@')[0];
    const usernameEl = document.querySelector(".username");
    const avatarEl = document.querySelector(".avatar");

    if (usernameEl) usernameEl.textContent = `${id} ▾`; // 不显示 email
    if (avatarEl) avatarEl.textContent = id.charAt(0).toUpperCase(); // 显示首字母
  }
});

// ✅ DOM 元素引用
const recentList = document.getElementById("recent-list");
const totalEl = document.getElementById("total-reports");
const pendingEl = document.getElementById("pending-reports");
const reviewedEl = document.getElementById("reviewed-reports");

let total = 0, pending = 0, reviewed = 0;

// ✅ 读取 submissions
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

      const industry = report.scores?.industry;
      const rawScore = industry?.score;
      const score = typeof rawScore === "string" ? parseInt(rawScore) : rawScore;
      const isReviewed = typeof score === "number" && !isNaN(score);

      const status = isReviewed ? "Reviewed" : "Pending";
      if (isReviewed) reviewed++;
      else pending++;

      const title = report.title;
      const subject = report.subject || "-";
      const timestamp = new Date(report.timestamp).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });

      const summaryText = report.summary || "<i>No summary provided.</i>";
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
        <div><strong>Student Summary:</strong> ${summaryText}</div>
        <div style="margin-top: 10px;">
          <button onclick="window.location.href='industrymanage.html?matric=${matric}&reportId=${reportSnap.key}'">
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

// ✅ 登出功能
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}
