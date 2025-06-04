import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFExtSGyQBc0RtH5y_NQM18DNAqO1j3O0",
  authDomain: "reactchat-afbcc.firebaseapp.com",
  projectId: "reactchat-afbcc",
  storageBucket: "reactchat-afbcc.firebasestorage.app",
  messagingSenderId: "421374830590",
  appId: "1:421374830590:web:147825e3571b15be3ac2af"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
