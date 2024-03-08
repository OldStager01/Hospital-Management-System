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

//Getting the data of the user
const userCred=JSON.parse(sessionStorage.getItem("user-cred"));
const userInfo=JSON.parse(sessionStorage.getItem("user-info"));

let checkCred=()=>{
    if(!sessionStorage.getItem("user-cred")){
        window.location.href="../Login/login_pat.html";
    }
    // if(!userInfo.isRegistered){
    //     alert("Kindly fill the Registration Form before proceeding.");
    //     window.location.href="../patient/patientregister.html";
    // }
}
window.addEventListener("load",checkCred);


console.log(userInfo);
const firstName=userInfo.firstName;
const lastName=userInfo.lastName;
const age=userInfo.age;

let setData=()=>{
    document.querySelectorAll(".firstName").forEach(element=>{element.innerText=firstName;});
    document.querySelectorAll(".lastName").forEach(element=>{element.innerText=lastName;});
}

let SignOut=()=>{
    sessionStorage.removeItem("user-cred"); 
    sessionStorage.removeItem("user-info");
    window.location.href='../Login/login_pat.html';
}
setData();
