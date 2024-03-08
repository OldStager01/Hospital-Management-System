import {db,auth, storage} from '../firebaseSetup.js';
import {setDoc, doc, onSnapshot, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import {ref as sRef, uploadBytesResumable, getDownloadURL} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"
//Authentication
let uid;
let ref;
let fName, lName;
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
        fName=data.firstName;
        document.getElementById("lastName").value=data.lastName;
        lName=data.lastName;
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
            age:age,
            guidelines:null,
            totalAppointments:0,
            nextAppointmentUID:null,
            nextAppointmentDate:null,
            nextAppointmentDoctorUID:null,  
            lastAppointmentUID:null,
            lastAppointmentDate:null,
            lastAppointmentDoctorUID:null,
            nextAppointmentStatus:null
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

async function getNowTime(){
    let dateNow
    await fetch('https://currentmillis.com/time/minutes-since-unix-epoch.php')
    .then(res => res.text())
    .then(min => {
        dateNow = new Date((parseInt(min) * 1000 * 60));
    }).catch(error=>{
        console.log(error);
    });
    return dateNow.now();
}
const fileUpload=document.getElementById("fileUpload");
const fileInput=document.getElementById("file");
const uploadProgress=document.getElementById("uploadProgress");
let downloadURL;
fileUpload.addEventListener("click",async event=>{
    const files=fileInput.files;
    
    for(let i=0;i<files.length;i++){
        const file=files[i];
        //Supported formats: pdf,doc, docx, txt
        //Maximum fileSize: 2MB
        const metadata={
            patientID:uid,
            fileFor: 'medicalRecords'
        }
        if ((file.type === 'application/pdf' ||
            file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'text/plain') && file.size <= 2 * 1024 * 1024){

                const fileName=file.name.split(' ').join('');
                const storageRef=await sRef(storage,`Patient/${uid}/MedicalRecords/MR_${fName+lName}_${getNowTime()}_${fileName}`);   
                const uploadFile=uploadBytesResumable(storageRef,file,metadata);
                uploadFile.on('state-changed', snapshot=>{
                    let progress=(snapshot.bytesTransferred / snapshot.totalBytes)*100;
                    uploadProgress.innerText=`Upload: ${progress}%`
                },(error)=>{
                    alert("File Not Uploaded");
                },()=>{
                    getDownloadURL(uploadFile.snapshot.ref).then((url)=>{
                        downloadURL=url;
                        console.log(url);
                    })
                }
)}
    }})
