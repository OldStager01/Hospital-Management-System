import {db,auth} from '../../firebaseSetup.js';
import {getDocs,doc, onSnapshot, getCountFromServer,collection, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let ref;
onAuthStateChanged(auth,async user=>{
    if(user){
        uid=user.uid;
        ref = doc(db, 'Doctor', uid);
        await fetchData(ref);
        await getPatientData();
    }else{
        window.location.href="../../Login/login_doc.html";
    }
})
const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});

//Setting Today

let dateNow
await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
  .then(res => res.text())
  .then(min => {
    dateNow = new Date((parseInt(min) * 1000 * 60));
    dateNow.setHours(0,0,0,0);
    dateNow=new Date(dateNow.getTime() + 5*60*60*1000 + 30*60*1000);
  }).catch(error=>{
    console.log(error);
  });
    console.log(dateNow);

//Data Fetching
const collRef=collection(db,'Patient');
let count;
const fetchData = (ref) => {
    onSnapshot(ref, async(docSnap) => {
        const data=docSnap.data();
        //console.log(docSnap);
        count=await getCountFromServer(collRef); 
        const patientCount=parseInt(count.data().count);
        console.log(patientCount);
        document.getElementById("firstName").textContent=data.firstName;    
        document.getElementById("lastName").textContent=data.lastName;
        document.getElementById("patientCount").textContent=patientCount;
        sessionStorage.setItem('doctorName',`${data.firstName} ${data.lastName}`);
    });
};

//Function to add dat in Table
const table=document.getElementById("upcomingPatient");
const addTableRow=(...data)=>{
    const rowNo=table.rows.length;
    const newRow= table.insertRow(rowNo);
    let colCounter=1;
    newRow.insertCell(0).innerHTML=rowNo;
    data.forEach(element => {
        const cell = newRow.insertCell(colCounter++);
        if (element instanceof HTMLButtonElement) {
            // If the element is a button, append it to the cell
            cell.appendChild(element);
        } else {
            // For other elements, convert to string and set innerHTML
            cell.innerHTML = String(element);
        }
    });
}

//Format Date
const formatDate=(date)=>{
     
     // Get the date components
     var year = date.getFullYear();
     var month = date.getMonth() + 1; // Month is zero-based
     var day = date.getDate();
     
     // Format the date
     return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
     }

let getPatientData=async()=>{
    let upcomingPatientCtr=0;
    console.log(uid);
    const upcomingPatientColl=query(collection(db,'Patient'),where('nextAppointmentDoctorUID','==',uid),where('nextAppointmentDate','==',dateNow),where('nextAppointmentStatus','==','confirmed'),orderBy('nextAppointmentDate'));
    const upcomingPatientDocs=await getDocs(upcomingPatientColl);
    upcomingPatientDocs.forEach(docSnap=>{
        document.getElementById("pendingAppt").textContent=++upcomingPatientCtr;
        const data=docSnap.data();
        const firstName=data.firstName;
        const lastName=data.lastName;
        const apptDate=formatDate(data.nextAppointmentDate.toDate());
        const x=document.createElement('button');
        x.type='button';
        x.classList.add('btn','btn-success');
        x.innerHTML='Appoint';
        x.addEventListener('click',async event=>{
            console.log(docSnap.id);
            sessionStorage.setItem('patient-cred',docSnap.id)
            sessionStorage.setItem('nextAppointment-cred',data.nextAppointmentUID);
            sessionStorage.setItem('lastAppointment-cred',data.lastAppointmentUID);
            
            window.location.href='../appoint.html';
        })
        addTableRow(`${firstName} ${lastName}`,apptDate,x);
    })
}