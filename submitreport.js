import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getDatabase, ref as databaseRef, get, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVE4Tzo8AgH82VoLBwUEr2mGvsToF2JDs",
  authDomain: "fyp-database-2172a.firebaseapp.com",
  databaseURL: "https://fyp-database-2172a-default-rtdb.firebaseio.com",
  projectId: "fyp-database-2172a",
  storageBucket: "fyp-database-2172a.firebasestorage.app",
  messagingSenderId: "216387345100",
  appId: "1:216387345100:web:eae3faa9f6577e15d58069"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);
const auth = getAuth();

let latestSubmission = null; // Variable to store the most recent submission

// Add event listener for the Submit button
document.getElementById("fyp_submission_form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from submitting the default way

    // Collect form data
    const issueDate = document.getElementById("issue_date").value;
    const author = document.getElementById("author").value;
    const title = document.getElementById("title").value;
    const subject = document.getElementById("subject").value;
    const files = document.getElementById("pdf").files; // Multiple PDF files
    const summary = document.getElementById("summary").value.trim();


    // Validation to ensure fields are not empty
    if (!issueDate || !author || !title || !subject ||  files.length === 0) {
        alert("Please fill out all fields and upload at least one PDF file before submitting.");
        return;
    }

    // Check if the user is signed in
    onAuthStateChanged(auth, function (user) {
        if (user) {
             const matricNumber = user.email.split('@')[0].toUpperCase();

            console.log('User is signed in:', user);

            // Save data to Firebase Realtime Database
            const uniqueKey = Date.now(); // Use a unique key based on timestamp
            const submissionRef = databaseRef(database, `submissions/${matricNumber}/${uniqueKey}`);


            const filePromises = Array.from(files).map(file => {
                // Save the PDF file to Firebase Storage
                const pdfStorageRef = storageRef(storage, `submissions/${matricNumber}/${uniqueKey}/${file.name}`);
                return uploadBytes(pdfStorageRef, file).then(() => getDownloadURL(pdfStorageRef));
            });

            Promise.all(filePromises)
                .then((fileUrls) => {
                    // Save the rest of the data to Realtime Database, including the PDF URLs
                    latestSubmission = {
                        issueDate: issueDate,
                        author: author,
                        matricNumber: matricNumber,
                        title: title,
                        subject: subject,
                        summary: summary,
                        timestamp: new Date().toISOString(),
                        pdfUrls: fileUrls,
                    };

                    return set(submissionRef, latestSubmission);
                })
                .then(() => {
                    const messageBox = document.getElementById("message-box");
                    messageBox.textContent = "Submission successfully saved!";
                    messageBox.style.color = "green"; // Change text color for success
                    document.getElementById("fyp_submission_form").reset(); // Reset the form
                })
                .catch((error) => {
                    const messageBox = document.getElementById("message-box");
                    messageBox.textContent = `Failed to save submission: ${error.message}`;
                    messageBox.style.color = "red"; // Change text color for errors
                    console.error("Error saving data:", error.message);
                });
        } else {
            console.log('No user is signed in.');
            alert("Please sign in to submit your project.");
            // Redirect to login page if needed
            window.location.href = "login.html";
        }
    });
});

document.getElementById("view_submissions").addEventListener("click", function () {
    const submissionTable = document.getElementById("submission_table");
    const tableBody = submissionTable.querySelector("tbody");

    if (latestSubmission) {
        // Clear the table and display the most recent submission with Update and Delete buttons
        tableBody.innerHTML = `
            <tr>
                <td>${latestSubmission.issueDate}</td>
                <td>${latestSubmission.matricNumber}</td>
                <td>${latestSubmission.author}</td>
                <td>${latestSubmission.title}</td>
                <td>${latestSubmission.subject}</td>
                
                <td>
                    ${latestSubmission.pdfUrls.map(
                        (url) => `<a href="${url}" target="_blank">View File</a>`
                    ).join(", ")}
                </td>
                <td>
                    <button class="btn-update" style="background-color: #20c997; color: white; border: none; padding: 8px 12px; border-radius: 6px;"  data-matric="${latestSubmission.matricNumber}">Update</button>
                    
                    <button class="btn-delete" data-matric="${latestSubmission.matricNumber}">Delete</button>
                </td>
            </tr>
        `;

        submissionTable.style.display = "table"; // Show the table

        // Add event listeners for Update and Delete buttons
        document.querySelectorAll(".btn-update").forEach((btn) =>
            btn.addEventListener("click", function () {
                const matricNumber = btn.getAttribute("data-matric");
                window.location.href = `myreports.html?matricNumber=${matricNumber}`;
            })
        );

        document.querySelectorAll(".btn-delete").forEach((btn) =>
            btn.addEventListener("click", function () {
                const matricNumber = btn.getAttribute("data-matric");
                if (confirm("Are you sure you want to delete this submission?")) {
                    // Delete from Firebase
                    const submissionRef = databaseRef(database, `submissions/${matricNumber}`);
                    set(submissionRef, null)
                        .then(() => {
                            alert("Submission deleted successfully!");
                            submissionTable.style.display = "none"; // Hide the table after deletion
                            location.reload(); // Refresh the page after deletion
                        })
                        .catch((error) => {
                            console.error("Error deleting submission:", error);
                            alert("Failed to delete submission.");
                        });
                }
            })
        );
    } else {
        alert("No recent submission found. You can go to the My Report page to find your profile. (If you already submit one time!!)");
        window.location.href = "myreports.html"; // Redirect to FYPs.html
    }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "login.html";
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



// --- 登出按钮功能 ---
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Logout 功能
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

