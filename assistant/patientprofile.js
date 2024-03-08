import {db,auth} from '../../firebaseSetup.js';
import {getDoc,doc, onSnapshot, getCountFromServer,setDoc, Timestamp, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid,lastApptUID;
let patientRef, lastAppointmentRef;
onAuthStateChanged(auth,async user=>{
    if(user){
        //Getting Patient Reference
        uid=await sessionStorage.getItem('patient-cred');
        sessionStorage.removeItem('patient-cred');
        patientRef = await doc(db,'Patient', uid);
        fetchUserData(patientRef); //Fetching user data
    }else{
        window.location.href="../../Login/login_asst.html";
    }
})
console.log(sessionStorage.getItem('doctorName'));
const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});

//Get the Current Date
async function getNowTime(){
    let dateNow
    await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
    .then(res => res.text())
    .then(min => {
        dateNow = new Date((parseInt(min) * 1000 * 60));
    }).catch(error=>{
        console.log(error);
    });
    return dateNow;
}

const viewMedicalHistoryButton=document.getElementById("medicalHistoryFieldsButton");
const viewMedicalHistory=document.getElementById("medicalHistoryFields");
viewMedicalHistoryButton.addEventListener("click",event=>{
    if(viewMedicalHistory.style.display=='none'){
        viewMedicalHistory.style.display='block';
        viewMedicalHistoryButton.innerText='Hide';
    }else{
        viewMedicalHistory.style.display='none';
        viewMedicalHistoryButton.innerText='View';
    }
    
})
let totalAppointments;
//Fetching UserData
let fetchUserData=async(ref, lastRef)=>{
    await onSnapshot(ref,async docSnap=>{
        const data=docSnap.data();
        document.getElementById("firstName").value=data.firstName;
        document.getElementById("lastName").value=data.lastName;
        document.getElementById("contact").value=data.contact;
        document.getElementById("email").value=data.email;
        document.getElementById("age").value=data.age;
        document.getElementById("gender").value=data.gender;
        document.getElementById("bloodGroup").value=data.bloodGroup;
        document.getElementById("allergies").value=data.medicalHistory.allergies;
        document.getElementById("medical").value=data.medicalHistory.medical;
        document.getElementById("family").value=data.medicalHistory.family;
        document.getElementById("surgical").value=data.medicalHistory.surgical;
        totalAppointments=data.totalAppointments;
        lastApptUID=data.lastAppointmentUID;
        console.log(lastApptUID)
        try{
            lastAppointmentRef = await doc(db,'Patient',uid,'Appointments', lastApptUID);
            const prevData=await getDoc(lastAppointmentRef);
            document.getElementById("lastGuidelines").value=prevData.data().guidelines;
            document.getElementById("doctorNotes").value=prevData.data().doctorNotes;
            document.getElementById("prevWeight").value=prevData.data().weight;
            document.getElementById("prevBloodPressure").value=prevData.data().bloodPressure;
        }
        catch(error){
            console.log(error);
            document.getElementById("lastApptDetails").style.display='none';
            const para=document.createElement('p');
            para.textContent="Participant Has Not Completed Any Appointment";
            para.classList.add("text-info");
            const paraContainer=document.getElementById("displayMessage");
            paraContainer.appendChild(para);
        }
    }
    )
}