// Import Firebase Functions
import { db, auth } from '../firebaseSetup.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { setDoc, doc, serverTimestamp, Timestamp, arrayUnion, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//Setting Max Date for Datepicker
let dateNow;
await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
  .then(res => res.text())
  .then(min => {
    dateNow = new Date(parseInt(min) * 1000 * 60);
    console.log(dateNow);
  }).catch(error=>{
    console.log(error);
  });
document.getElementById('dob').max = dateNow.toISOString().split('T')[0];


//Sign Up
const signUp=document.getElementById("signUp");
signUp.addEventListener("click", async event=>{
  try{
    event.preventDefault();
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const firstName=document.getElementById("firstname").value;
    const lastName=document.getElementById("lastname").value;
    const contact=document.getElementById("contact").value;
    const userCreatedAt=serverTimestamp();
    const dob=Timestamp.fromDate(new Date(document.getElementById('dob').value));
    if(!email || !password || !firstName|| !lastName||!contact||!userCreatedAt||!dob) throw new Error("Invalid Data Entered");
        //Updating Patient Database
        const cred= await createUserWithEmailAndPassword(auth,email,password);
        console.log(cred);
        const ref=doc(db,'Patient',cred.user.uid);
        await setDoc(ref,{
            firstName: firstName,
            lastName: lastName,
            dob: dob,
            email:email,
            contact:contact,
            isRegistered:false,
            isDoctorAssgined:false,
            isNewUser:true,
            role: 'patient',
            userCreatedAt: userCreatedAt,
        })
      window.location.href='../login/login_pat.html'
    }catch(error){
        console.log(error);
        alert(error.message);
    }
});

