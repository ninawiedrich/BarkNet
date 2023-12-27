import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdNBHPq1R8PGquBv7N0AmjSrAK3mzeGaY",
  authDomain: "bark-net-app.firebaseapp.com",
  projectId: "bark-net-app",
  storageBucket: "bark-net-app.appspot.com",
  messagingSenderId: "925313625738",
  appId: "1:925313625738:web:eb8ee066546c95dc920773"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app)