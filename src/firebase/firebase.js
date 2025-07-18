// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9ZiHgLht7o26FtG6al5w87b3zDI9-adY",
  authDomain: "job-portal-2adc8.firebaseapp.com",
  projectId: "job-portal-2adc8",
  storageBucket: "job-portal-2adc8.firebasestorage.app",
  messagingSenderId: "278511566410",
  appId: "1:278511566410:web:fd4929594a07dfae1b30b3",
  measurementId: "G-LYS20J3KGJ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
