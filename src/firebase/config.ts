import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMa1bsO0xTL6flFwACVEGADM7H8N10EIU",
  authDomain: "doc-pro-5e412.firebaseapp.com",
  projectId: "doc-pro-5e412",
  storageBucket: "doc-pro-5e412.appspot.com",
  messagingSenderId: "626249897853",
  appId: "1:626249897853:web:dddc875cc43aa6b2c15e14",
  measurementId: "G-928M9ZLXSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); 