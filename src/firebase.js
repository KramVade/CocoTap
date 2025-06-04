import { initializeApp } from 'firebase/app'; 
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
  signInWithPopup,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'; 
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
  addDoc,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIe4_kxZRUE7mjOXdQUR--Megbah4alwE",
  authDomain: "cocotap-7d09a.firebaseapp.com",
  projectId: "cocotap-7d09a",
  storageBucket: "cocotap-7d09a.appspot.com",
  messagingSenderId: "649138599029",
  appId: "1:649138599029:web:718be14d2a95c1b7e5743c",
  measurementId: "G-TS9EZDMVQK"
};

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

// Configure Google Auth Provider
provider.setCustomParameters({
  prompt: 'select_account'
});

const firestore = getFirestore(app);

export { 
    app,
    auth, 
    provider, 
    signInWithRedirect,
    getRedirectResult,
    signInWithPopup,
    signOut, 
    onAuthStateChanged,
    firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    addDoc,
    limit
};

async function handleGoogleLogin() {
  console.log('Login button clicked');
  // ...rest of your code
}
