import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// --- Firebase Config ---
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
const auth = getAuth();
const database = getDatabase(app);
const storage = getStorage(app);

// --- On Login ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
    return;
  }

  const matric = user.email.split('@')[0].toUpperCase();
  document.querySelector('.username').textContent = `${matric} ▾`;
  document.querySelector('.avatar').textContent = matric.charAt(0);
  loadMyReports(matric);
});

// --- Load Reports ---
function loadMyReports(matric) {
  const reportList = document.getElementById("report-list");
  const submissionsRef = dbRef(database, `submissions/${matric}`);

  onValue(submissionsRef, (snapshot) => {
    reportList.innerHTML = "";

    if (!snapshot.exists()) {
      reportList.innerHTML = "<p>No reports submitted yet.</p>";
      return;
    }

    const submissions = snapshot.val();
    Object.entries(submissions).forEach(([key, data]) => {
      if (!data || !data.title || !data.timestamp || !data.pdfUrls || data.pdfUrls.length === 0) return;

      const title = data.title.trim();
      const time = new Date(data.timestamp).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });
      const fileLinks = data.pdfUrls.map(url => `<a href="${url}" target="_blank">View</a>`).join("<br>");

      const card = document.createElement("div");
      card.className = "report-card";
      card.setAttribute("data-title", title.toLowerCase());

      card.innerHTML = `
  <h3>${title}</h3>
  <p><strong>Submitted on:</strong> ${time}</p>
  <p><strong>Files:</strong><br>${fileLinks}</p>

  <div class="summary-section">
    <label for="summary-${key}"><strong>Summary:</strong></label>
    <textarea id="summary-${key}" class="summary-textarea" data-key="${key}" rows="4" placeholder="Enter summary...">${data.summary || ""}</textarea>
    
    <div class="action-buttons-row">
      <button class="btn-save-summary" data-key="${key}">💾 Save</button>
      <button class="btn-delete"
              data-matric="${matric}"
              data-key="${key}"
              data-urls='${JSON.stringify(data.pdfUrls)}'>
        🗑️ Delete
      </button>
    </div>
  </div>
`;

      reportList.appendChild(card);
    });

    // Save summary to Firebase
   document.querySelectorAll(".btn-save-summary").forEach((btn) => {
   btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-key");
    const textarea = document.querySelector(`textarea.summary-textarea[data-key="${key}"]`);
    const summary = textarea.value.trim();
    const reportRef = dbRef(database, `submissions/${matric}/${key}`);
    update(reportRef, { summary })
      .then(() => alert("Summary saved successfully."))
      .catch((err) => alert("Failed to save summary: " + err.message));
  });
});


    // Bind delete events
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        const matric = btn.getAttribute("data-matric");
        let pdfUrls = [];
        try {
          pdfUrls = JSON.parse(btn.getAttribute("data-urls"));
        } catch (e) {
          alert("Invalid file URLs.");
          return;
        }
        deleteReport(matric, key, pdfUrls);
      });
    });
  });
}

// --- Search ---
window.searchReports = function () {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".report-card");
  cards.forEach(card => {
    const title = card.getAttribute("data-title") || "";
    card.style.display = title.includes(input) ? "block" : "none";
  });
};

// --- Delete ---
function deleteReport(matric, key, pdfUrls) {
  if (!confirm("Are you sure you want to delete this report?")) return;

  const submissionRef = dbRef(database, `submissions/${matric}/${key}`);
  remove(submissionRef)
    .then(() => {
      const deletePromises = pdfUrls.map(url => {
        const path = decodeURIComponent(new URL(url).pathname.split("/o/")[1].split("?")[0]);
        const fileRef = storageRef(storage, path);
        return deleteObject(fileRef);
      });

      
      const card = document.querySelector(`.report-card textarea[data-key="${key}"]`)?.closest('.report-card');
      if (card) card.remove();

      alert("Report and files deleted successfully.");
      return Promise.all(deletePromises);
    })
    .catch(err => alert("Failed to delete report or files: " + err.message));
}


 
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Logout 
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}


  // Contact popup toggle
  const toggleBtn = document.getElementById("contact-toggle");
  const contactPopup = document.getElementById("contact-popup");
  if (toggleBtn && contactPopup) {
    toggleBtn.addEventListener("click", () => {
      contactPopup.style.display = (contactPopup.style.display === "block") ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!toggleBtn.contains(e.target) && !contactPopup.contains(e.target)) {
        contactPopup.style.display = "none";
      }
    });
  }
  // WhatsApp popup toggle
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

