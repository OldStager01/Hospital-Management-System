import {db,auth} from '../../firebaseSetup.js';
import {doc,getDocs,collection, query, orderBy, Timestamp, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let ref;
onAuthStateChanged(auth,async user=>{
    if(user){
        uid=user.uid;
        //ref=doc(db,Patient,uid);
        await getPatientData();
    }else{
        window.location.href="../../Login/login_doc.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});


//Function to add dat in Table
const table=document.getElementById("appointmentsTable");
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


let getPatientData=async()=>{
    const collRef=await query(collection(db,'Patient',uid,'Appointments'),orderBy('appointmentDate'));
    const allDocs=await getDocs(collRef);
    allDocs.forEach(docSnap=>{
    const data=docSnap.data();
    const docName=  `Dr. ${data.doctorName}`;
    const status=data.status;
    let apptDate, regAt;
    try{
        apptDate=(data.appointmentCompletionTime).toDate().toDateString();
        
    }catch{
        try{
            apptDate=(data.appointmentDate).toDate().toDateString();
        }catch{
            apptDate='N/A';
        console.log("Error Reading date");
        }
    }
    const x=document.createElement('button');
    x.type='button';
    x.classList.add('btn','btn-success');
    x.innerHTML='View';
    x.addEventListener('click',async event=>{
        console.log(docSnap.id);    
        sessionStorage.setItem('appointment-cred',docSnap.id);      
        window.location.href='viewAppointment.html';
    })
    addTableRow(docName ,apptDate,status,x);
})}
