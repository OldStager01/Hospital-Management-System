import {db,auth} from '../../firebaseSetup.js';
import {doc,getDoc,collection, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid, apptUID;
onAuthStateChanged(auth,async user=>{
    if(user){
        uid=user.uid;
        apptUID=sessionStorage.getItem('appointment-cred');
        await fetchData();
    }else{
        window.location.href="../../Login/login_pat.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});

//Format Date
const formatDate=(date)=>{
     // Get the day of the week
     var dayOfWeek = date.getDay();
     var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
     var dayName = daysOfWeek[dayOfWeek];
 
     // Get the date components
     var year = date.getFullYear();
     var month = date.getMonth() + 1; // Month is zero-based
     var day = date.getDate();
     
     // Format the date
     return `${dayName} ${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
     }

const fetchData=async()=>{
    const patDoc=await doc(db,'Patient',uid,'Appointments',apptUID);
    const docSnap=await getDoc(patDoc);
    const data=docSnap.data();
    if(data.status=='completed'){
        document.getElementById("appointmentDate").value=formatDate(data.appointmentCompletionTime.toDate());
        document.getElementById("doctorName").value=data.doctorName;
        document.getElementById("weight").value=data.weight;
        document.getElementById("bloodPressure").value=data.bloodPressure;
        document.getElementById("guidelines").value=data.guidelines;
        document.getElementById("status").value=data.status;
        
    }
    else if(data.status=='confirmed'){
        document.getElementById("weightRow").style.display='none'
        document.getElementById("bloodPressureRow").style.display='none'
        document.getElementById("guidelinesRow").style.display='none'
        document.getElementById("appointmentDate").value=formatDate(data.appointmentDate.toDate());
        document.getElementById("status").value=data.status;
        document.getElementById("doctorName").value=data.doctorName;
    }
}


