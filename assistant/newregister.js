import {db,auth} from '../firebaseSetup.js';
import {setDoc, doc, onSnapshot, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

//Authentication
let uid;
let ref;

onAuthStateChanged(auth,user=>{
    if(user){
        uid=user.uid;
        ref = doc(db, 'Patient', uid);
        console.log(user);
        fetchData();
    }else{
        window.location.href="../Login/login_pat.html";
    }
})
const signoutBtn=document.getElementById('logout');
signoutBtn.addEventListener("click",event=>{
    signOut(auth);
});

let fetchData=()=>{
    onSnapshot(ref,docSnap=>{
        const data=docSnap.data();
        document.getElementById("firstName").value=data.firstName;
        document.getElementById("lastName").value=data.lastName;
        document.getElementById("email").value=data.email;
        document.getElementById("contact").value=data.contact;
        //document.getElementById("bloodGroup").value=data.bloodGroup;
        const dob=data.dob.toDate();
        const formattedDate = dob.getFullYear() + '-' + pad((dob.getMonth() + 1), 2) + '-' + pad(dob.getDate(), 2);
        document.getElementById("dob").value=formattedDate;
        const gender=data.gender;
        document.querySelectorAll(".gender").forEach(element=>{
            if(element.value==gender) element.checked=true;
        })
    }
    )
}

//Set Blood Groups:
var bloodGroupSelect = document.getElementById("bloodGroup");

// Array of valid blood groups
var validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-",   "O+", "O-"];

// Add options to the select element
validBloodGroups.forEach(bloodGroup=> {
  var option = document.createElement("option");
  option.value = bloodGroup;
  option.text = bloodGroup;
  bloodGroupSelect.add(option);
});

const submitForm=document.getElementById("submit");
submitForm.addEventListener("click",async event=>{
    event.preventDefault();
    try{
        const genderOptions=document.querySelectorAll(".gender");
        let gender;
        genderOptions.forEach(g=>{
            if(g.checked){gender=g.value;}
        })
        const age=getAge();
        ///const bloodGroupList=getElementById("bloodGroup");
        const bloodGroup=bloodGroupSelect.options[bloodGroupSelect.selectedIndex].value;
        await setDoc(ref,{
            bloodGroup: bloodGroup,
            gender:gender,
            address:document.getElementById("address").value,
            pincode:document.getElementById("pincode").value,
            //TODO: Patient Medical Records File
            medicalHistory:{
                allergies:document.getElementById("allergies").value,
                medical:document.getElementById("medical").value,
                family:document.getElementById("family").value,
                surgical:document.getElementById("surgical").value,
            },
            additionalInstructions:document.getElementById("AddText").value,
            registrationAt:serverTimestamp(),
            isRegistered:true,
            age:age
            
        },{merge:true});
       window.location.href="../patient/dashboard.html";
    }catch(error){
        console.log(error);
        alert(error.message);
    }
})                             

function getAge(){
    const birthdateInput = document.getElementById('dob');
    const birthdateValue = birthdateInput.value;

    if (!birthdateValue) {
        alert('Please select a valid birthdate');
        return;
    }

    const birthdate = new Date(birthdateValue);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthdate.getFullYear();

    if (
        currentDate.getMonth() < birthdate.getMonth() ||
        (currentDate.getMonth() === birthdate.getMonth() &&
        currentDate.getDate() < birthdate.getDate())
    ) {
        age--;
    }
    return age;
}

function pad(number, length) {
    var str = String(number);
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  }