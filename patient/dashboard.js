import {db,auth} from '../firebaseSetup.js';
import {doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let isRegistered;
let ref;

onAuthStateChanged(auth,async user=>{
    if(user){
        uid=user.uid;
        console.log(user);
        ref = doc(db, 'Patient', uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists() && docSnap.data().role === 'patient') {
                fetchData(ref);
        } else {
            alert("User Not a Patient");       
            signOut(auth);
        }
    }else{
        window.location.href="../Login/login_pat.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});


//Data Fetching
const fetchData = (ref) => {
    onSnapshot(ref, (docSnap) => {
        const data=docSnap.data();
        isRegistered=data.isRegistered;
        if(!isRegistered){
            alert("Kindly fill the Registration Form before proceeding.");
            window.location.href="../patient/patientregister.html";
        }
        document.querySelectorAll(".firstName").forEach(element=>{element.textContent=data.firstName;});
        document.querySelectorAll(".lastName").forEach(element=>{element.textContent=data.lastName;});
        document.getElementById("age").textContent = data.age;
        document.getElementById("gender").textContent = data.gender;
        document.getElementById("bloodGroup").textContent = data.bloodGroup;
        const guidelines=data.guidelines;
        guidelines!=null?document.getElementById("guidelines").textContent=guidelines:"Guidelines Here";
        const table=document.getElementById("appointmentTable");
        const newRow=table.insertRow(1);
        newRow.insertCell(0).innerHTML=`Dr. ${data.nextAppointmentDoctorName}`;
        newRow.insertCell(1).innerHTML=(data.nextAppointmentDate).toDate().toDateString();
    });
};