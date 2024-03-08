import {db,auth} from '../../firebaseSetup.js';
import {doc, onSnapshot, getCountFromServer,collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let ref;
onAuthStateChanged(auth,user=>{
    if(user){
        uid=user.uid;
        ref = doc(db, 'Assistant', uid);
        fetchData(ref);
    }else{
        window.location.href="../../Login/login_asst.html";
    }
})

const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",async event=>{
    signOut(auth);
});

//Data Fetching
const fetchData = (ref) => {
    onSnapshot(ref, async(docSnap) => {
        const data=docSnap.data();
        console.log(docSnap);
        const count=await getCountFromServer(collection(db,'Patient')); 
        const patientCount=parseInt(count.data().count);
        const count1=await getCountFromServer(collection(db,'MiscData','PatientsData','NewUsers')); 
        const countNewUsers=parseInt(count1.data().count);
        console.log(patientCount);
        document.getElementById("firstName").textContent=data.firstName;    
        document.getElementById("lastName").textContent=data.lastName;
        document.getElementById("patientCount").textContent=patientCount;
        document.getElementById("newUsers").textContent=countNewUsers;
    });
};


