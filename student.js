// --- Firebase imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.appspot.com",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Auth State Change Listener ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "Login.html";
    return;
  }
const matric = user.email.split('@')[0].toUpperCase();

  const usernameEl = document.querySelector('.username');
  const avatarEl = document.querySelector('.avatar');
  if (usernameEl) usernameEl.textContent = `${matric} ▾`;
  if (avatarEl) avatarEl.textContent = matric.charAt(0).toUpperCase();

  if (document.getElementById("report-list")) {
    const filter = document.getElementById("status-filter")?.value || "all";
    loadReports(matric, filter);
  }

  if (document.getElementById("academic-name")) {
    try {
      const docRef = doc(db, "students", matric);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("academic-name").textContent = data.academic_name || "-";
        document.getElementById("industry-name").textContent = data.industry_name || "-";
      }
    } catch (error) {
      console.error("Failed to load student info:", error);
    }
  }

  if (document.getElementById("monitoring-info")) {
    loadMonitoringInfo(matric);
  }

  if (document.getElementById("form-feedback")) {
    loadMonitoringForm(matric);
  }

  const filterSelect = document.getElementById("status-filter");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const selected = filterSelect.value;
      loadReports(matric, selected);
    });
  }
});



// --- Load Reports ---
async function loadReports(matric, statusFilter = "all") {
  const list = document.getElementById("report-list");
  if (!list) return;

  list.innerHTML = "Loading...";

  try {
    const q = query(collection(db, "reports"), where("submittedBy", "==", matric));
    const snapshot = await getDocs(q);

    list.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.status || "Pending";
      const feedback = data.feedback || null;
      const time = data.submittedAt?.toDate().toLocaleString() || "N/A";

      if (statusFilter !== "all" && status !== statusFilter) return;

      const card = document.createElement("div");
      card.className = "report-card";
      card.innerHTML = `
        <div class="report-title">${data.title}</div>
        <div class="report-meta">Company: ${data.company} | Submitted: ${time}</div>
        <div class="report-status ${status === 'Reviewed' ? 'status-reviewed' : 'status-pending'}">
          ${status}
        </div>
        ${feedback ? `<div class="feedback-box"><strong>Feedback:</strong><br>${feedback}</div>` : ""}
        ${data.attachment ? `<p><a href="${data.attachment}" target="_blank">📎 View Attachment</a></p>` : ""}
      `;
      list.appendChild(card);
    });

    if (!list.hasChildNodes()) {
      list.innerHTML = "<p>No reports found for this filter.</p>";
    }

  } catch (error) {
    console.error("Failed to load reports:", error.message);
    list.innerHTML = "<p>Error loading reports.</p>";
  }
}

// --- Load Monitoring Info ---
async function loadMonitoringInfo(matric) {
  const container = document.getElementById("monitoring-info");
  if (!container) return;

  container.innerHTML = "Loading monitoring info...";

  try {
    const docRef = doc(db, "monitorings", matric);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      container.innerHTML = `
        <div class="submit-section">
          <h3>Monitoring Arrangement</h3>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Mode:</strong> ${data.mode}</p>
          <p><strong>Topic:</strong> ${data.topic}</p>
          <p><strong>Supervisor:</strong> ${data.supervisor_name}</p>
        </div>
      `;
    } else {
      container.innerHTML = "<p>No monitoring arrangement found.</p>";
    }
  } catch (error) {
    console.error("Error loading monitoring info:", error);
    container.innerHTML = "<p>Error loading monitoring info.</p>";
  }
}



// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          alert("Logout successful. See you next time!");
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Logout failed:", error);
          alert("Logout failed. Please try again.");
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
});







