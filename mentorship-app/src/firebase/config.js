import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSwbIk0OH-Yb0Xxs6gWz4grP_kgTScLJM",
  authDomain: "ravenship-693ab.firebaseapp.com",
  projectId: "ravenship-693ab",
  storageBucket: "ravenship-693ab.firebasestorage.app",
  messagingSenderId: "603507552625",
  appId: "1:603507552625:web:7be06080ad56f3d4ca06d0"
};

// Clean up stale IndexedDB databases from before memory cache switch
try { indexedDB.deleteDatabase("firebase-heartbeat-database"); } catch (_) {}
try { indexedDB.deleteDatabase("firestore/[DEFAULT]/ravenship-693ab/main"); } catch (_) {}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});
export const storage = getStorage(app);
export default app;
