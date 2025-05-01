import { initializeApp } from 'firebase/app'; 

import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 

 

const firebaseConfig = {
    apiKey: "AIzaSyAz4Ii6pA4HsxbmffFAE3-5Kh8tTNz-sAs",
    authDomain: "cocotap-963b5.firebaseapp.com",
    projectId: "cocotap-963b5",
    storageBucket: "cocotap-963b5.firebasestorage.app",
    messagingSenderId: "1065918197117",
    appId: "1:1065918197117:web:f99657a44023211038f014",
    measurementId: "G-DFJK0T1S2T"
  };
 

const app = initializeApp(firebaseConfig); 

const auth = getAuth(app); 

const provider = new GoogleAuthProvider(); 

 

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged }; 