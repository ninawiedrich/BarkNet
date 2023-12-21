import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOwbIL4Y-pBIf0x3UZ9GzuHPx_O41sAnA",
  authDomain: "barknet-9f96b.firebaseapp.com",
  projectId: "barknet-9f96b",
  storageBucket: "barknet-9f96b.appspot.com",
  messagingSenderId: "1008694935006",
  appId: "1:1008694935006:web:81a7a0cc9880d453aab14f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
