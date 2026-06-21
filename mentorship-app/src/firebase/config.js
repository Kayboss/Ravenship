import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSwbIk0OH-Yb0Xxs6gWz4grP_kgTScLJM",
  authDomain: "ravenship-693ab.firebaseapp.com",
  projectId: "ravenship-693ab",
  storageBucket: "ravenship-693ab.firebasestorage.app",
  messagingSenderId: "603507552625",
  appId: "1:603507552625:web:7be06080ad56f3d4ca06d0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
