import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5PE2iENsutGi9igPSSFrGChcNx4QRzgo",
  authDomain: "mabilisan-8459b.firebaseapp.com",
  projectId: "mabilisan-8459b",
  storageBucket: "mabilisan-8459b.firebasestorage.app",
  messagingSenderId: "538309309238",
  appId: "1:538309309238:web:9b051a0c43b6b3f5ccf997",
  measurementId: "G-SCQFTYRSZ7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialized successfully:", !!app);

export { auth, firestore, storage };
