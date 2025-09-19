import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEk8hZsICPodp_uOE4JVJMZU7mZGlelWs",
  authDomain: "prepwise-e8891.firebaseapp.com",
  projectId: "prepwise-e8891",
  storageBucket: "prepwise-e8891.firebasestorage.app",
  messagingSenderId: "774704931137",
  appId: "1:774704931137:web:fe93ecd0f586672b0541c0",
  measurementId: "G-S5WQTCEFK3"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);