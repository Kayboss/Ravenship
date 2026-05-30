import { db } from "./config";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove, Timestamp
} from "firebase/firestore";
import { getStoredUser } from "./auth";

// ── Users ──

export const getUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

export const verifyUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { verified: true });
};

export const unverifyUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { verified: false });
};

// ── Courses ──

export const getCourses = async () => {
  const snap = await getDocs(collection(db, "courses"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCourse = async (id) => {
  const snap = await getDoc(doc(db, "courses", id));
  if (!snap.exists()) return null;
  const assignmentsSnap = await getDocs(collection(db, "courses", id, "assignments"));
  const assignments = assignmentsSnap.docs.map(a => ({ id: a.id, ...a.data() }));
  return { id: snap.id, ...snap.data(), assignments };
};

export const addCourse = async (data) => {
  const ref = await addDoc(collection(db, "courses"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
};

export const updateCourse = async (id, data) => {
  await updateDoc(doc(db, "courses", id), data);
};

export const deleteCourse = async (id) => {
  await deleteDoc(doc(db, "courses", id));
};

export const enrollMentee = async (courseId, menteeId) => {
  await updateDoc(doc(db, "courses", courseId), {
    enrolledMentees: arrayUnion(menteeId)
  });
};

// ── Assignments (subcollection under courses) ──

export const addAssignment = async (courseId, data) => {
  const ref = await addDoc(collection(db, "courses", courseId, "assignments"), {
    ...data, createdAt: serverTimestamp()
  });
  return ref.id;
};

export const updateAssignment = async (courseId, assignmentId, data) => {
  await updateDoc(doc(db, "courses", courseId, "assignments", assignmentId), data);
};

export const deleteAssignment = async (courseId, assignmentId) => {
  await deleteDoc(doc(db, "courses", courseId, "assignments", assignmentId));
};

// ── Submissions ──

export const getSubmissions = async (filters = {}) => {
  let constraints = [];
  if (filters.menteeId) constraints.push(where("menteeId", "==", filters.menteeId));
  if (filters.courseId) constraints.push(where("courseId", "==", filters.courseId));
  if (filters.assignmentId) constraints.push(where("assignmentId", "==", filters.assignmentId));
  const q = query(collection(db, "submissions"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addSubmission = async (data) => {
  const ref = await addDoc(collection(db, "submissions"), {
    ...data, status: "pending", submittedAt: serverTimestamp()
  });
  return ref.id;
};

export const updateSubmission = async (id, data) => {
  await updateDoc(doc(db, "submissions", id), data);
};

// ── Gradebook ──

export const getGradebook = async (menteeId) => {
  const q = query(collection(db, "gradebook"), where("menteeId", "==", menteeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllGradebook = async () => {
  const snap = await getDocs(collection(db, "gradebook"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateGradebook = async (id, data) => {
  await updateDoc(doc(db, "gradebook", id), data);
};

export const setGradebookEntry = async (menteeId, courseId, scores) => {
  const q = query(
    collection(db, "gradebook"),
    where("menteeId", "==", menteeId),
    where("courseId", "==", courseId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, "gradebook"), { menteeId, courseId, scores, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(doc(db, "gradebook", snap.docs[0].id), { scores, updatedAt: serverTimestamp() });
  }
};

// ── Community Posts ──

export const getPosts = async () => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addPost = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    authorId: user?.id || "",
    authorName: user?.name || "Unknown",
    authorRole: user?.role || "",
    likes: [],
    comments: [],
    createdAt: serverTimestamp()
  });
  return ref.id;
};

export const togglePostLike = async (postId) => {
  const user = getStoredUser();
  if (!user) return;
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if ((data.likes || []).includes(user.id)) {
    await updateDoc(ref, { likes: arrayRemove(user.id) });
  } else {
    await updateDoc(ref, { likes: arrayUnion(user.id) });
  }
};

export const addComment = async (postId, text) => {
  const user = getStoredUser();
  if (!user) return;
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    comments: arrayUnion({
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      text,
      createdAt: new Date().toISOString()
    })
  });
};

// ── Events ──

export const getEvents = async () => {
  const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addEvent = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "events"), {
    ...data, createdBy: user?.id || "", createdAt: serverTimestamp()
  });
  return ref.id;
};

export const deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id));
};

// ── Notifications ──

export const getNotifications = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addNotification = async (data) => {
  const ref = await addDoc(collection(db, "notifications"), {
    ...data, read: false, createdAt: serverTimestamp()
  });
  return ref.id;
};

export const markNotificationRead = async (id) => {
  await updateDoc(doc(db, "notifications", id), { read: true });
};

// ── Announcements / Help Guides ──

export const getAnnouncements = async () => {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addAnnouncement = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "announcements"), {
    ...data, createdBy: user?.id || "", createdAt: serverTimestamp()
  });
  return ref.id;
};

export const getHelpGuides = async () => {
  const snap = await getDocs(collection(db, "helpGuides"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addHelpGuide = async (data) => {
  const ref = await addDoc(collection(db, "helpGuides"), {
    ...data, createdAt: serverTimestamp()
  });
  return ref.id;
};

// ── Analytics (aggregate helpers) ──

export const getAnalytics = async () => {
  const users = await getUsers();
  const courses = await getCourses();
  const mentors = users.filter(u => u.role === "mentor").length;
  const mentees = users.filter(u => u.role === "mentee").length;
  const verified = users.filter(u => u.verified).length;
  const submissions = await getSubmissions();
  const graded = submissions.filter(s => s.score != null).length;
  return {
    total: users.length,
    mentors,
    mentees,
    verified,
    totalCourses: courses.length,
    totalSubmissions: submissions.length,
    gradedSubmissions: graded,
    completionRate: submissions.length ? Math.round((graded / submissions.length) * 100) : 0
  };
};
