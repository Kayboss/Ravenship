import { auth, db } from "./config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const loginWithEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    throw new Error("Account not set up. Contact your administrator.");
  }
  const userData = userDoc.data();
  if (userData.deleted) {
    throw new Error("This account has been removed. Contact your administrator.");
  }
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
  const user = getStoredUser();
  if (user?.id) {
    try { await updateDoc(doc(db, "users", user.id), { online: false }); } catch {}
  }
  await signOut(auth);
  const uid = user?.id;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  if (uid) {
    localStorage.removeItem("settings_" + uid);
  }
  localStorage.removeItem("settings");
  localStorage.removeItem("enrolledCourses");
  localStorage.removeItem("topbar_messages");
  localStorage.removeItem("topbar_notifications");
  localStorage.removeItem("topbar_unread_messages");
  localStorage.removeItem("topbar_unread_notifications");
};

let presenceUnsub = null;
let heartbeatInterval = null;

const HEARTBEAT_INTERVAL = 30000;
const ONLINE_THRESHOLD = 120000;

export const isUserOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const ts = lastSeen?.toDate ? lastSeen.toDate() : new Date(lastSeen);
  return (Date.now() - ts.getTime()) < ONLINE_THRESHOLD;
};

export const watchPresence = () => {
  if (presenceUnsub) presenceUnsub();
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  const unsub = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        await updateDoc(doc(db, "users", fbUser.uid), {
          online: true,
          lastSeen: serverTimestamp(),
        });
      } catch {}

      heartbeatInterval = setInterval(async () => {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await updateDoc(doc(db, "users", currentUser.uid), {
              lastSeen: serverTimestamp(),
            });
          }
        } catch {}
      }, HEARTBEAT_INTERVAL);
    } else {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    }
  });

  const handleBeforeUnload = () => {
    const user = getStoredUser();
    if (user?.id) {
      updateDoc(doc(db, "users", user.id), {
        online: false,
        lastSeen: serverTimestamp(),
      }).catch(() => {});
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  presenceUnsub = () => {
    unsub();
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };

  return presenceUnsub;
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
const fireReadyCallbacks = () => { _authReadyCallbacks.forEach(cb => cb()); _authReadyCallbacks.length = 0; };
onAuthStateChanged(auth, (user) => {
  _authReady = true;
  fireReadyCallbacks();
});
export const onAuthReady = (cb) => {
  if (_authReady) { cb(); return; }
  if (auth.currentUser) { _authReady = true; cb(); return; }
  const stored = getStoredUser();
  if (stored) {
    let handled = false;
    const retry = setInterval(() => {
      if (_authReady || auth.currentUser) {
        clearInterval(retry);
        clearTimeout(fallback);
        if (!handled) { handled = true; _authReady = true; cb(); }
      }
    }, 300);
    const fallback = setTimeout(() => {
      clearInterval(retry);
      if (!handled) { handled = true; _authReady = true; cb(); }
    }, 10000);
    _authReadyCallbacks.push(() => { clearInterval(retry); clearTimeout(fallback); if (!handled) { handled = true; cb(); } });
  } else {
    _authReadyCallbacks.push(cb);
  }
};
