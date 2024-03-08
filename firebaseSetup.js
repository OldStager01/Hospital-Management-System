import firebaseConfig from "./firebaseConfig.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import {getStorage} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"


//Initialize Firebase
const initFirebase=initializeApp(firebaseConfig);
const db=getFirestore(initFirebase);
let auth=getAuth(initFirebase);
let storage=getStorage();
export {db, auth, storage};