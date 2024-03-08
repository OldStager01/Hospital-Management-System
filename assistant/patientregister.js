import {db,auth} from '../firebaseSetup.js';
import {setDoc,getDocs, doc, onSnapshot, Timestamp, serverTimestamp,collection, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

onAuthStateChanged(auth,async user=>{
    if(user){       
        uid=await sessionStorage.getItem('patient-cred');
        sessionStorage.removeItem('patient-cred');
        ref = await doc(db,'Patient', uid);
        console.log(user);
        fetchData();
    }else{
        window.location.href="../Login/login_asst.html";
    }
})

//Setting Min Date for Datepicker

let dateNow
await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
  .then(res => res.text())
  .then(min => {
    dateNow = new Date((parseInt(min) * 1000 * 60));
  }).catch(error=>{
    console.log(error);
  });
    console.log(dateNow);
    document.getElementById('date').min = dateNow.toISOString().split('T')[0];    

//Set Blood Groups:
var bloodGroupSelect = document.getElementById("bloodGroup");

// Array of valid blood groups
var validBloodGroups = ["-","A+", "A-", "B+", "B-", "AB+", "AB-",   "O+", "O-"];

// Add options to the select element
validBloodGroups.forEach(bloodGroup=> {
  var option = document.createElement("option");
  option.value = bloodGroup;
  option.text = bloodGroup;
  bloodGroupSelect.add(option);
});

//Authentication
let uid;
let ref;
let doctorSelect;
let fetchData=async()=>{
    onSnapshot(ref,docSnap=>{
        const data=docSnap.data();
        document.getElementById("firstName").value=data.firstName;
        document.getElementById("lastName").value=data.lastName;
        document.getElementById("email").value=data.email;
        document.getElementById("contact").value=data.contact;
        document.getElementById("bloodGroup").value=data.bloodGroup;
        document.getElementById("age").value=data.age;
    }
    )
doctorSelect = document.getElementById("doctor-select");
// Add options to the select element
const doctors=await getDocs(collection(db,'Doctor'));
doctors.forEach(doctor=>{
    const option = document.createElement("option");
    option.value = `${doctor.data().firstName} ${doctor.data().lastName}`;
    option.id = doctor.id;
    option.innerHTML=`${doctor.data().firstName} ${doctor.data().lastName}`;
    doctorSelect.add(option);
})

}

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",event=>{
    signOut(auth);
});

const submitForm=document.getElementById("registerForm");
submitForm.addEventListener("submit",async event=>{
    event.preventDefault();
    try{
        let dateNow
        await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
        .then(res => res.text())
        .then(min => {
            dateNow = new Date((parseInt(min) * 1000 * 60));
            dateNow.setDate(dateNow.getDate()+1);
        }).catch(error=>{
            console.log(error);
        });
        const apptRef=collection(db,'Patient',uid,'Appointments');
        const count=await getCountFromServer(apptRef);
        const docRef=doc(apptRef);
        let apptDate=Timestamp.fromDate(new Date(document.getElementById('date').value));
        const docUID=doctorSelect.options[doctorSelect.selectedIndex].id;
        const docName=doctorSelect.options[doctorSelect.selectedIndex].value;
        await setDoc(docRef,{
            status:'confirmed',
            appointmentDate: apptDate,
            doctorUID: docUID,
            doctorName: docName,
            createdAt: dateNow
        },{merge:true})
        await setDoc(ref,{
            nextAppointmentUID:docRef.id,
            nextAppointmentDate:apptDate,
            nextAppointmentDoctorName: docName,
            nextAppointmentDoctorUID:docUID,
            nextAppointmentStatus:'confirmed',
            lastAppointment:null,
            registrationAt:serverTimestamp(),
            isNewUser:false,    
            totalAppointments: count.data().count+1,
        },{merge:true});
       window.location.href="unregistered.html";
    }catch(error){
        console.log(error);
        alert(error.message);
    }
})                             

