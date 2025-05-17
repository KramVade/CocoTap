import { initializeApp } from 'firebase/app'; 
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { getDatabase, ref, set, onValue, push } from 'firebase/database';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { VueFire, useFirestore, useDatabase } from 'vuefire';

const firebaseConfig = {
    apiKey: "AIzaSyAz4Ii6pA4HsxbmffFAE3-5Kh8tTNz-sAs",
    authDomain: "cocotap-963b5.firebaseapp.com",
    projectId: "cocotap-963b5",
    storageBucket: "cocotap-963b5.appspot.com",
    messagingSenderId: "1065918197117",
    appId: "1:1065918197117:web:f99657a44023211038f014",
    measurementId: "G-DFJK0T1S2T",
    databaseURL: "https://cocotap-963b5-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();
const database = getDatabase(app);
const firestore = getFirestore(app);

export { 
    app,
    auth, 
    provider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    database,
    ref,
    set,
    onValue,
    push,
    VueFire,
    useDatabase,
    firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    addDoc
};
