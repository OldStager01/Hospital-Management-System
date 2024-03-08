import {db,auth} from '../../firebaseSetup.js';
import {getDocs,doc, onSnapshot, where,collection, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
onAuthStateChanged(auth,user=>{
    if(user){
        uid=user.uid;
    }else{
        window.location.href="../../Login/login_asst.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});


//Table
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

//Format Date
const formatDate=(date)=>{

   // Get the time components
    var hours = date.getHours();
    var minutes = date.getMinutes();
    // Determine AM/PM
    var ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, set it to 12

    // Format the time
    var timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    
    // Get the date components
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // Month is zero-based
    var day = date.getDate();
    
    // Format the date
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}  ${timeString}`;
    }
//Data Fetch    
const collRef=collection(db,'Patient');
const q=await query(collRef,where('isNewUser','==',true),orderBy("userCreatedAt","desc"));
const allDocs=await getDocs(q);
allDocs.forEach(docSnap=>{
    const data=docSnap.data();
    const firstName=data.firstName;
    const lastName=data.lastName;
    const userCreatedAt=formatDate(data.userCreatedAt.toDate());
    const x=document.createElement('button');
    x.type='button';
    x.classList.add('btn','btn-success');
    x.innerHTML='Register';
    x.addEventListener('click',async event=>{
        console.log(docSnap.id);
        sessionStorage.setItem('patient-cred',docSnap.id)
        window.location.href='patientregister.html';
    })
    addTableRow(`${firstName} ${lastName}`,userCreatedAt,x);
})

