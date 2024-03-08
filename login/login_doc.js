// Import Firebase Functions
import { db, auth } from '../firebaseSetup.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Sign In
const signInForm = document.getElementById("loginForm");
signInForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error);
        alert(error.message);
    }
});

onAuthStateChanged(auth, async user => {
    if (user) {
        const uid = user.uid;
        console.log(uid, typeof (uid));
        const ref = doc(db, 'Doctor', uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists() && docSnap.data().role === 'doctor') {
            document.getElementById("loginForm").reset();
            window.location.href = "../doctor/dashboard/dashboard.html";
        } else {
            alert("User Not a Doctor");
            signOut(auth);
        }
    } else {
        // Check if the user is not on the login page before redirecting
        if (window.location.pathname !== "/Login/login_doc.html") {
            window.location.href = "../Login/login_doc.html";
        }
    }
});
