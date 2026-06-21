import { auth, db } from "./config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const loginWithEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    throw new Error("Account not set up. Contact your administrator.");
  }
  const userData = userDoc.data();
  const stored = {
    id: user.uid,
    name: userData.name,
    email: user.email,
    role: userData.role,
    verified: userData.verified,
    phone: userData.phone,
    city: userData.city,
    bio: userData.bio,
    photoURL: userData.photoURL || "",
  };
  localStorage.setItem("user", JSON.stringify(stored));
  return { user, userData };
};

export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      callback({ user, userData });
    } else {
      callback(null);
    }
  });
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

let _authReady = false;
const _authReadyCallbacks = [];
onAuthStateChanged(auth, (user) => { if (user) { _authReady = true; _authReadyCallbacks.forEach(cb => cb()); _authReadyCallbacks.length = 0; } });
export const onAuthReady = (cb) => {
  if (_authReady) { cb(); return; }
  if (auth.currentUser) { _authReady = true; cb(); return; }
  const stored = getStoredUser();
  if (stored) {
    let handled = false;
    const retry = setInterval(() => {
      if (_authReady || auth.currentUser) {
        clearInterval(retry);
        if (!handled) { handled = true; _authReady = true; cb(); }
      }
    }, 300);
    _authReadyCallbacks.push(() => { clearInterval(retry); if (!handled) { handled = true; cb(); } });
  } else {
    _authReadyCallbacks.push(cb);
  }
};
