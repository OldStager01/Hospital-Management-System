//Import Firebase Functions
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getFirestore,collection, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {getAuth,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Firebase Configuration Details
const firebaseConfig = {
    apiKey: "AIzaSyAsg7VJoAFsiCAKxHzYzePE3QWN6FI5o1E",
    authDomain: "sattv-auth.firebaseapp.com",
    databaseURL: "https://sattv-auth-default-rtdb.firebaseio.com",
    projectId: "sattv-auth",
    storageBucket: "sattv-auth.appspot.com",
    messagingSenderId: "27656472919",
    appId: "1:27656472919:web:42bdc6a37bb1feb202d612"
  };

//Initialize Firebase
initializeApp(firebaseConfig);
const auth=getAuth();
const db=getFirestore();

//Initialize the Reference Parent Collection
const collRef=collection(db,"Users");

//Check Authentication


//Sign Up
const signUpForm=document.getElementById("SignUp");
signUpForm.addEventListener("submit", async event=>{
    event.preventDefault();
    const email=document.getElementById("SignupUsername").value;
    const password=document.getElementById("SignupPassword").value;
    const name=document.getElementById("name").value;
    try{
        const cred= await createUserWithEmailAndPassword(auth,email,password);
        console.log(cred);
        signUpForm.reset();
        const ref=doc(db,'Users',cred.user.uid);
        await setDoc(ref,{
            Name: name,
            Email: email
        })

    }catch(error){
        console.log(error);
    }

});

//Sign Out
const signOutBtn=document.getElementById("signOut");
signOutBtn.addEventListener("click",async event=>{
    sessionStorage.removeItem("user-cred");
    sessionStorage.removeItem("user-info");
    await signOut(auth);
    window.location.href='index.html';
})


//Sign In
const signInForm=document.getElementById("loginForm");
signInForm.addEventListener("submit", async event=>{
    event.preventDefault();
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value
    const cred=await signInWithEmailAndPassword(auth,email,password);
    const ref=doc(db,'Users',cred.user.uid);
    const docSnap=await getDoc(ref);
    if(docSnap.exists()){
        console.log("Logged In");
        sessionStorage.setItem('user-info',JSON.stringify({
            name:docSnap.data().Name,
            email:docSnap.data().Email
        }))
    }
        sessionStorage.setItem('user-cred',JSON.stringify(cred.user));
        window.location.href="../homepage/index.html";
})