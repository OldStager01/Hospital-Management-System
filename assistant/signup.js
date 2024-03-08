// Import Firebase Functions
import { db, auth } from '../firebaseSetup.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//Sign Up
const signUp=document.getElementById("signUpForm");
signUp.addEventListener("submit", async event=>{
    event.preventDefault();
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const firstName=document.getElementById("firstname").value;
    const lastName=document.getElementById("lastname").value;
    const userCreatedAt=serverTimestamp();
    const genderOptions=document.querySelectorAll(".gender");
    let gender=null;
        genderOptions.forEach(g=>{
            if(g.checked){gender=g.value;}
        })
    try{
        const cred= await createUserWithEmailAndPassword(auth,email,password);
        console.log(cred);
        const ref=doc(db,'Assistant',cred.user.uid);
        await setDoc(ref,{
            firstName: firstName,
            lastName: lastName,
            email:email,
            isAssistant:true,
            role:'assistant',
            userCreatedAt: userCreatedAt,
            gender:gender
        })
      window.location.href='../login/login_doc.html'
    }catch(error){
        console.log(error);
        alert(error.message);
    }

});