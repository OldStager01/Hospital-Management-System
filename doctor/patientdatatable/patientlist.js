import {db,auth} from '../../firebaseSetup.js';
import {doc,getDocs,collection, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let ref;
onAuthStateChanged(auth,user=>{
    if(user){
        uid=user.uid;
        ref = doc(db, 'Doctor', uid);
    }else{
        window.location.href="../../Login/login_doc.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});


//Function to add dat in Table
const table=document.getElementById("patientData");
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


//Data Fetch
const collRef=query(collection(db,'Patient'),orderBy('firstName'));
const allDocs=await getDocs(collRef);
const pendingApptCtr=0;
allDocs.forEach(docSnap=>{
    const data=docSnap.data();
    const firstName=data.firstName;
    const lastName=data.lastName;
    const apptStatus=data.nextAppointmentStatus;
    const isRegistered=data.isRegistered?'Yes':'No';
    let nextAppt;
    try{
    nextAppt=(data.nextAppointmentDate).toDate().toDateString();
    }catch{
        nextAppt='N/A';
        console.log("Error");
    }
    const doc=data.nextAppointmentDoctorName;
    const x=document.createElement('button');
    x.type='button';
    x.classList.add('btn','btn-success');
    x.innerHTML='View';
    x.addEventListener('click',async event=>{
        console.log(docSnap.id);
        sessionStorage.setItem('patient-cred',docSnap.id); 
        window.location.href='../patientProfile.html';
    })
    addTableRow(`${firstName} ${lastName}`,isRegistered,doc,nextAppt,x);
})
