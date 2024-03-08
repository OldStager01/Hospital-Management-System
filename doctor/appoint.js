import {db,auth} from '../../firebaseSetup.js';
import {getDoc,doc, onSnapshot, getCountFromServer,setDoc, Timestamp, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid, apptUid,lastApptUID, docUID;
let patientRef,appointmentRef, lastAppointmentRef;
onAuthStateChanged(auth,async user=>{
    if(user){
        docUID=user.uid;
        //Getting Patient Reference
        uid=await sessionStorage.getItem('patient-cred');
        sessionStorage.removeItem('patient-cred');
        patientRef = await doc(db,'Patient', uid);

        //Getting Patient's Appointment referene
        apptUid=await sessionStorage.getItem('nextAppointment-cred');
        sessionStorage.removeItem('nextAppointment-cred');
        appointmentRef = await doc(db,'Patient',uid,'Appointments', apptUid);

        //Getting Patient's Last Appointment Reference
        lastApptUID=await sessionStorage.getItem('lastAppointment-cred');
        sessionStorage.removeItem('lastAppointment-cred');
        if(lastApptUID==null) {lastAppointmentRef=null;}
        else {lastAppointmentRef = await doc(db,'Patient',uid,'Appointments', lastApptUID);}

        fetchUserData(patientRef,lastAppointmentRef); //Fetching user data
    }else{
        window.location.href="../../Login/login_doc.html";
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
        document.getElementById("nextAppointmentDate").min=dateNow.toISOString().split('T')[0];
    }).catch(error=>{
        console.log(error);
    });
    return dateNow;
}
const minTimeForDatePicker=(getNowTime())
let isNextAppointment=true;
const nextAppointmentNo=document.getElementById("nextAppointmentNo");
nextAppointmentNo.addEventListener("change",event=>{
    const ele=document.getElementById("nextAppointment");
    ele.style.display='none';
    ele.firstChild.setAttribute('required','false');
    isNextAppointment=false;
})

const nextAppointmentYes=document.getElementById("nextAppointmentYes");
nextAppointmentYes.addEventListener("change",event=>{
    document.getElementById("nextAppointment").style.display='flex';
    document.getElementById("nextAppointmentDate").setAttribute('required','true');
    isNextAppointment=true;

})

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
    await onSnapshot(ref, async docSnap=>{
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
            const prevData=await getDoc(lastRef);
            document.getElementById("lastGuidelines").value=prevData.data().guidelines;
            document.getElementById("lastDoctorNotes").value=prevData.data().doctorNotes;
            document.getElementById("prevWeight").innerText=prevData.data().weight;
            document.getElementById("prevBloodPressure").innerText=prevData.data(),bloodPressure;
            }
        catch{
            document.querySelectorAll(".prevData").forEach(element=>{element.style.display='none';})
            const para=document.createElement('p');
            para.textContent="Participant Has Not Completed Any Previous Appointment";
            para.classList.add("text-info");
            const paraContainer=document.getElementById("displayMessage");
            paraContainer.appendChild(para);
        }
    }
    )

}

const submitForm=document.getElementById("appointmentForm");
submitForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const nowTime=await getNowTime();
    //Updating Appointment
    await setDoc(appointmentRef,{
        guidelines:document.getElementById("guidelines").value,
        doctorNotes:document.getElementById("doctorNotes").value,
        weight:document.getElementById("weight").value,
        bloodPressure:document.getElementById("bloodPressure").value,
        status:'completed',
        appointmentCompletionTime: Timestamp.fromDate(nowTime),
    },{'merge':true})

    //If the Doctor Selected next Appointment details
    let nextAppointmentUID=null;
    let nextAppointmentDate=null;
    let nextAppointmentDoctorUID=null;
    if(isNextAppointment){
        const docRef=doc(collection(db,'Patient',uid,'Appointments'));
        nextAppointmentUID=docRef.id;
        nextAppointmentDate=Timestamp.fromDate(new Date(document.getElementById('nextAppointmentDate').value));
        nextAppointmentDoctorUID=docUID;
        totalAppointments=totalAppointments+1;
        
        await setDoc(docRef,{
            status:'confirmed',
            appointmentDate:nextAppointmentDate,
            doctorUID: nextAppointmentDoctorUID,
            doctorName: sessionStorage.getItem('doctorName'),
            createdAt: nowTime
        },{merge:true});
    }
    //Updating the Patient DB
    await setDoc(patientRef,{
        nextAppointmentUID:nextAppointmentUID,
        nextAppointmentDate:nextAppointmentDate,
        nextAppointmentDoctorUID:nextAppointmentDoctorUID,
        nextAppointmentDoctorName: sessionStorage.getItem('doctorName'),
        totalAppointments:totalAppointments,
        guidelines:document.getElementById("guidelines").value,
        lastAppointmentUID:appointmentRef.id,
        lastAppointmentDate:nowTime,
        lastAppointmentDoctorUID:docUID
    },{'merge':true})
    window.location.href='dashboard/dashboard.html'
})