// --- Firebase imports ---
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

    // Populate profile page
    if (document.getElementById("supervisor-name")) {
      document.getElementById("supervisor-name").textContent = id;
      document.getElementById("supervisor-email").textContent = email;
      document.getElementById("supervisor-id").textContent = id;
    }

    // Conditional page loading
    if (document.getElementById("recent-list")) loadRecentReports();
    if (document.getElementById("report-list")) loadManageReports();
    if (document.getElementById("history-list")) loadHistoryReports();
    if (document.getElementById("meeting-form")) handleMeetingForm(id); // 👈 新增
  }
});

async function loadRecentReports() {
  const q = query(collection(db, "reports"), orderBy("submittedAt", "desc"));
  const snap = await getDocs(q);
  const list = document.getElementById("recent-list");
  list.innerHTML = "";

  let total = 0, pending = 0, reviewed = 0;

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    total++;
    if (data.status === "Reviewed") reviewed++;
    else pending++;

    const item = document.createElement("div");
    item.className = "report-card";
    item.innerHTML = `
      <div class="report-title">${data.title}</div>
      <div class="report-meta">${data.submittedBy} | ${data.company}</div>
      <div class="report-status ${data.status === 'Reviewed' ? 'status-reviewed' : 'status-pending'}">${data.status}</div>
    `;
    list.appendChild(item);
  });

  document.getElementById("total-reports").textContent = total;
  document.getElementById("pending-reports").textContent = pending;
  document.getElementById("reviewed-reports").textContent = reviewed;
}

async function loadManageReports() {
  const filter = document.getElementById("status-filter").value;
  const q = query(collection(db, "reports"));
  const snap = await getDocs(q);
  const list = document.getElementById("report-list");
  list.innerHTML = "";

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const docRef = doc(db, "reports", docSnap.id);
    if (filter !== "all" && data.status !== filter) return;

    const card = document.createElement("div");
    card.className = "report-card";
    card.innerHTML = `
      <div class="report-title">${data.title}</div>
      <div class="report-meta">${data.submittedBy} | ${data.company}</div>
      <div class="report-status ${data.status === 'Reviewed' ? 'status-reviewed' : 'status-pending'}">${data.status}</div>
      <textarea placeholder="Add feedback...">${data.feedback || ""}</textarea><br>
      <select>
        <option value="Pending" ${data.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="Reviewed" ${data.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
      </select>
      <button>Save</button>
    `;
    const button = card.querySelector("button");
    button.addEventListener("click", async () => {
      const feedback = card.querySelector("textarea").value;
      const status = card.querySelector("select").value;
      await updateDoc(docRef, { feedback, status });
      alert("Updated successfully");
      loadManageReports();
    });

    list.appendChild(card);
  });

  document.getElementById("status-filter").addEventListener("change", loadManageReports);
}




// --- Handle Schedule Meeting Submission ---
function handleMeetingForm(supervisorName) {
  const form = document.getElementById("meeting-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentId = document.getElementById("student-id").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const mode = document.getElementById("mode").value.trim();
    const topic = document.getElementById("topic").value.trim();

    if (!studentId || !date || !time || !mode || !topic) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await setDoc(doc(db, "monitorings", studentId), {
        student_id: studentId,
        date,
        time,
        mode,
        topic,
        supervisor_name: supervisorName
      });

      alert("Meeting scheduled successfully!");
      form.reset();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Failed to schedule meeting.");
    }
  });
}


// --- Handle Monitoring Evaluation Form Submission ---
const monitoringForm = document.getElementById("monitoring-form");

if (monitoringForm) {
  monitoringForm.addEventListener("submit", async (e) => {
    e.preventDefault();

   
    const studentId = document.getElementById("student-id").value.trim();
    if (!studentId) {
      alert("Student ID is required.");
      return;
    }

    
    const data = {
      studentName: document.getElementById("student-name").value.trim(),
      studentId,
      faculty: document.getElementById("faculty").value.trim(),
      programme: document.getElementById("programme").value.trim(),
      batch: document.getElementById("batch").value.trim(),

      companyName: document.getElementById("companyName").value.trim(),
      briefed: document.getElementById("briefed").value,
      guidance: document.getElementById("guidance").value.trim(),
      adapting: document.getElementById("adapting").value.trim(),
      tasks: document.getElementById("tasks").value.trim(),
      challenges: document.getElementById("challenges").value.trim(),

      industryName: document.getElementById("name").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      email: document.getElementById("email").value.trim(),
      assignedTasks: document.getElementById("assignedTasks").value.trim(),
      response: document.getElementById("response").value.trim(),
      attendance: document.getElementById("attendance").value.trim(),
      communication: document.getElementById("communication").value.trim(),
      otherComments: document.getElementById("otherComments").value.trim(),

      submittedAt: new Date().toISOString()
    };

    try {
    
      const formRef = doc(db, "monitoringForms", studentId); // ← ensure `doc` and `setDoc` are imported
      await setDoc(formRef, data);

      alert("Monitoring form submitted successfully.");
      monitoringForm.reset();
    } catch (error) {
      console.error("Error submitting monitoring form:", error);
      alert("Submission failed. Please try again.");
    }
  });
}


const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}
