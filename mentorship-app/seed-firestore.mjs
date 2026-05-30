/**
 * Run this once after creating users in Firebase Console.
 *
 * Steps:
 * 1. Go to https://console.firebase.google.com/project/ravenship-693ab/authentication/users
 *    → Click "Add user" and create these 3 accounts:
 *       - tripelkay@gmail.com / Raven@26
 *       - daisy@gmail.com / Test1234!
 *       - raven@gmail.com / Mentor123!
 *
 * 2. Copy each user's UID from the Auth table (click on user to see details)
 *
 * 3. Paste the UIDs below and run: node seed-firestore.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSwbIk0OH-Yb0Xxs6gWz4grP_kgTScLJM",
  authDomain: "ravenship-693ab.firebaseapp.com",
  projectId: "ravenship-693ab",
  storageBucket: "ravenship-693ab.firebasestorage.app",
  messagingSenderId: "603507552625",
  appId: "1:603507552625:web:7be06080ad56f3d4ca06d0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── PASTE USER UIDs from Firebase Console here ──
const UIDS = {
  admin: "REPLACE_WITH_ADMIN_UID",
  daisy: "REPLACE_WITH_DAISY_UID",
  raven: "REPLACE_WITH_RAVEN_UID",
};
// ────────────────────────────────────────────────

async function seed() {
  // Users collection
  await setDoc(doc(db, "users", UIDS.admin), {
    name: "Kay",
    email: "tripelkay@gmail.com",
    role: "admin",
    verified: true,
    phone: "",
    city: "",
    bio: "",
    createdAt: Timestamp.now(),
  });

  await setDoc(doc(db, "users", UIDS.daisy), {
    name: "Daisy",
    email: "daisy@gmail.com",
    role: "mentee",
    verified: true,
    phone: "+1 555-123-4567",
    city: "New York",
    bio: "Excited to learn and grow!",
    createdAt: Timestamp.now(),
  });

  await setDoc(doc(db, "users", UIDS.raven), {
    name: "Raven",
    email: "raven@gmail.com",
    role: "mentor",
    verified: true,
    phone: "+1 555-987-6543",
    city: "San Francisco",
    bio: "Experienced mentor ready to guide.",
    createdAt: Timestamp.now(),
  });

  // Sample course
  const courseRef = await addDoc(collection(db, "courses"), {
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, and JavaScript from scratch.",
    mentorId: UIDS.raven,
    instructor: "Raven",
    enrolledMentees: [UIDS.daisy],
    createdAt: Timestamp.now(),
  });

  // Sample assignment in the course
  await addDoc(collection(db, "courses", courseRef.id, "assignments"), {
    title: "Build a Personal Portfolio",
    description: "Create a personal portfolio page using HTML and CSS.",
    dueDate: "2026-06-30",
    maxScore: 100,
    createdAt: Timestamp.now(),
  });

  // Sample post
  await addDoc(collection(db, "posts"), {
    authorId: UIDS.admin,
    authorName: "Kay",
    authorRole: "admin",
    text: "Welcome to the Mentorship Hub! Feel free to introduce yourself.",
    likes: [],
    comments: [],
    createdAt: Timestamp.now(),
  });

  // Community settings
  await setDoc(doc(db, "communitySettings", "main"), {
    name: "Ravenship Mentorship",
    description: "A vibrant community for mentors and mentees.",
    welcomeMessage: "Welcome to the community!",
    allowMemberPosts: true,
    createdAt: Timestamp.now(),
  });

  console.log("✅ Firestore seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
