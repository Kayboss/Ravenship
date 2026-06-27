import { db } from "./config";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp, arrayUnion, arrayRemove, Timestamp, onSnapshot, writeBatch
} from "firebase/firestore";
import { getStoredUser } from "./auth";
import { sanitizeInput } from "../lib/sanitize";

// Fields that intentionally store HTML/structured data — rendered safely via DOMPurify or React JSX (auto-escaped)
const RICH_FIELDS = new Set(["content", "lessonContent", "syllabus", "stack", "description"]);
const sanitizeWrite = (data) => {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      if (RICH_FIELDS.has(key) || value.startsWith("data:")) {
        out[key] = value.length > 500000 ? value.slice(0, 500000) : value;
      } else {
        out[key] = sanitizeInput(value.length > 500000 ? value.slice(0, 500000) : value);
      }
    } else if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      out[key] = sanitizeWrite(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

// ── Users ──

export const getUsers = async (role) => {
  if (role) {
    const q = query(collection(db, "users"), where("role", "==", role));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => !u.deleted);
  }
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => !u.deleted);
};

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getUserByEmail = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const getAdmins = async () => {
  const q = query(collection(db, "users"), where("role", "==", "admin"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => !u.deleted);
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), sanitizeWrite(data));
};

export const deleteUser = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
};

export const verifyUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { verified: true });
};

export const unverifyUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { verified: false });
};

// ── Mentor / Mentee Management ──

export const assignMenteeToMentor = async (mentorId, menteeId) => {
  await updateDoc(doc(db, "users", menteeId), { mentorId });
  await updateDoc(doc(db, "users", mentorId), {
    assignedMentees: arrayUnion(menteeId)
  });
  logActivity("Mentee assigned", { detail: `Mentee ${menteeId} assigned to mentor ${mentorId}`, mentorId, menteeId });
};

export const removeMenteeFromMentor = async (mentorId, menteeId) => {
  await updateDoc(doc(db, "users", menteeId), { mentorId: "" });
  await updateDoc(doc(db, "users", mentorId), {
    assignedMentees: arrayRemove(menteeId)
  });
  logActivity("Mentee removed", { detail: `Mentee ${menteeId} removed from mentor ${mentorId}`, mentorId, menteeId });
};

export const getMentors = async () => {
  const q = query(collection(db, "users"), where("role", "==", "mentor"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUnassignedMentees = async () => {
  const q = query(collection(db, "users"), where("role", "==", "mentee"));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => !u.mentorId);
};

export const getMenteesByMentor = async (mentorId) => {
  const q = query(collection(db, "users"), where("role", "==", "mentee"), where("mentorId", "==", mentorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Courses ──

export const getCourses = async (mentorId) => {
  if (mentorId) {
    const q = query(collection(db, "courses"), where("createdBy", "==", mentorId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
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
  const ref = await addDoc(collection(db, "courses"), { ...sanitizeWrite(data), createdAt: serverTimestamp() });
  logActivity("Course created", { detail: `Course "${data.title}" created` });
  return ref.id;
};

export const updateCourse = async (id, data) => {
  await updateDoc(doc(db, "courses", id), sanitizeWrite(data));
  logActivity("Course updated", { detail: `Course "${data.title}" updated`, courseId: id });
};

export const deleteCourse = async (id) => {
  await deleteDoc(doc(db, "courses", id));
  logActivity("Course deleted", { detail: `Course ${id} deleted` });
};

export const enrollMentee = async (courseId, menteeId) => {
  await updateDoc(doc(db, "courses", courseId), {
    enrolledMentees: arrayUnion(menteeId)
  });
  logActivity("Mentee enrolled", { detail: `Mentee ${menteeId} enrolled in course ${courseId}`, courseId, menteeId });
};

// ── Enrollments (course progress per user) ──

export const getEnrollments = async (userId) => {
  const q = query(collection(db, "enrollments"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const result = {};
  snap.docs.forEach(d => {
    const data = d.data();
    result[data.courseTitle] = { firestoreId: d.id, ...data };
  });
  return result;
};

export const setEnrollment = async (userId, courseTitle, data) => {
  const q = query(
    collection(db, "enrollments"),
    where("userId", "==", userId),
    where("courseTitle", "==", courseTitle)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, "enrollments"), {
      userId,
      courseTitle,
      ...data,
      updatedAt: serverTimestamp()
    });
  } else {
    await updateDoc(doc(db, "enrollments", snap.docs[0].id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
};

export const deleteEnrollment = async (userId, courseTitle) => {
  const q = query(
    collection(db, "enrollments"),
    where("userId", "==", userId),
    where("courseTitle", "==", courseTitle)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(doc(db, "enrollments", snap.docs[0].id));
  }
};

// ── Assignments (top-level collection) ──

export const getAssignments = async (mentorId) => {
  if (mentorId) {
    const q = query(collection(db, "assignments"), where("mentorId", "==", mentorId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, firestoreId: d.id, ...d.data() }));
  }
  const snap = await getDocs(collection(db, "assignments"));
  return snap.docs.map(d => ({ id: d.id, firestoreId: d.id, ...d.data() }));
};

export const addAssignment = async (data) => {
  const ref = await addDoc(collection(db, "assignments"), { ...sanitizeWrite(data), createdAt: serverTimestamp() });
  logActivity("Assignment created", { detail: `Assignment "${data.title}" created for course "${data.course}"` });
  return ref.id;
};

export const updateAssignment = async (id, data) => {
  await updateDoc(doc(db, "assignments", id), sanitizeWrite(data));
  logActivity("Assignment updated", { detail: `Assignment "${data.title}" updated`, assignmentId: id });
};

export const deleteAssignment = async (id) => {
  await deleteDoc(doc(db, "assignments", id));
  logActivity("Assignment deleted", { detail: `Assignment ${id} deleted` });
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
    ...sanitizeWrite(data), status: "pending", submittedAt: serverTimestamp()
  });
  logActivity("Assignment submitted", { detail: `Submission for assignment "${data.assignmentId}" by mentee ${data.menteeId}` });
  return ref.id;
};

export const updateSubmission = async (id, data) => {
  await updateDoc(doc(db, "submissions", id), sanitizeWrite(data));
  if (data.score !== undefined) {
    logActivity("Submission graded", { detail: `Submission ${id} graded: ${data.score}`, submissionId: id });
  } else {
    logActivity("Submission updated", { detail: `Submission ${id} updated`, submissionId: id });
  }
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
  await updateDoc(doc(db, "gradebook", id), sanitizeWrite(data));
};

export const setGradebookEntry = async (menteeId, courseId, scores) => {
  const q = query(
    collection(db, "gradebook"),
    where("menteeId", "==", menteeId),
    where("courseId", "==", courseId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, "gradebook"), { menteeId, courseId, scores: sanitizeWrite(scores), updatedAt: serverTimestamp() });
    logActivity("Gradebook entry created", { detail: `Gradebook entry for mentee ${menteeId} course ${courseId}` });
  } else {
    await updateDoc(doc(db, "gradebook", snap.docs[0].id), { scores: sanitizeWrite(scores), updatedAt: serverTimestamp() });
    logActivity("Gradebook entry updated", { detail: `Gradebook entry for mentee ${menteeId} course ${courseId}` });
  }
};

// ── Community Posts ──

export const getPosts = async () => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getPosts failed:", e);
    const snap = await getDocs(collection(db, "posts"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

export const addPost = async (data) => {
  const user = getStoredUser();
  const postData = {
    text: sanitizeInput(data.text || ""),
    authorId: user?.id || "",
    authorName: sanitizeInput(user?.name || "Unknown"),
    authorRole: user?.role || "",
    authorPhotoURL: user?.photoURL || "",
    likes: [],
    comments: [],
    createdAt: serverTimestamp()
  };
  if (data.image) postData.image = data.image && data.image.length > 500000 ? data.image.slice(0, 500000) : data.image;
  const ref = await addDoc(collection(db, "posts"), postData);
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
      authorName: sanitizeInput(user.name),
      text: sanitizeInput(text),
      createdAt: new Date().toISOString()
    })
  });
};

export const updatePost = async (postId, data) => {
  await updateDoc(doc(db, "posts", postId), sanitizeWrite(data));
};

export const deletePost = async (postId) => {
  await deleteDoc(doc(db, "posts", postId));
};

// ── Events ──

export const getEvents = async () => {
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getEvents failed:", e);
    const snap = await getDocs(collection(db, "events"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

export const addEvent = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "events"), {
    ...sanitizeWrite(data), createdBy: user?.id || "", createdAt: serverTimestamp()
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
    ...sanitizeWrite(data), read: false, createdAt: serverTimestamp()
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
    ...sanitizeWrite(data), createdBy: user?.id || "", createdAt: serverTimestamp()
  });
  return ref.id;
};

export const getHelpGuides = async () => {
  const snap = await getDocs(collection(db, "helpGuides"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addHelpGuide = async (data) => {
  const ref = await addDoc(collection(db, "helpGuides"), {
    ...sanitizeWrite(data), createdAt: serverTimestamp()
  });
  return ref.id;
};

// ── Counselling Requests ──

export const addCounsellingRequest = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "counsellingRequests"), {
    ...sanitizeWrite(data),
    userId: user?.id || "",
    userName: sanitizeInput(user?.name || data.name || ""),
    userEmail: sanitizeInput(user?.email || data.email || ""),
    createdAt: serverTimestamp()
  });
  return ref.id;
};

// ── Analytics (aggregate helpers) ──

export const getAnalytics = async () => {
  const users = await getUsers();
  const courses = await getCourses();
  const mentors = users.filter(u => u.role === "mentor").length;
  const mentees = users.filter(u => u.role === "mentee").length;
  const admins = users.filter(u => u.role === "admin").length;
  const verified = users.filter(u => u.verified).length;
  const submissions = await getSubmissions();
  const graded = submissions.filter(s => s.score != null).length;
  return {
    total: users.length,
    mentors,
    mentees,
    admins,
    verified,
    pending: users.length - verified,
    totalCourses: courses.length,
    totalSubmissions: submissions.length,
    gradedSubmissions: graded,
    completionRate: submissions.length ? Math.round((graded / submissions.length) * 100) : 0
  };
};

// ── Conversations / Messages ──

export const getOrCreateConversation = async (participantIds) => {
  if (participantIds.length !== 2) throw new Error("Need exactly 2 participants");
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", participantIds[0])
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const data = d.data();
    return data.participants?.length === 2 && data.participants.includes(participantIds[1]);
  });
  if (existing) return existing.id;

  const [user1, user2] = await Promise.all([getUser(participantIds[0]), getUser(participantIds[1])]);
  const ref = await addDoc(collection(db, "conversations"), {
    participants: participantIds,
    participantInfo: {
      [participantIds[0]]: { name: sanitizeInput(user1?.name || "Unknown"), photoURL: user1?.photoURL || "" },
      [participantIds[1]]: { name: sanitizeInput(user2?.name || "Unknown"), photoURL: user2?.photoURL || "" }
    },
    typing: {},
    lastMessage: null,
    lastUpdated: serverTimestamp()
  });
  return ref.id;
};

export const sendMessage = async (conversationId, text) => {
  const user = getStoredUser();
  if (!user) return;
  const safeText = sanitizeInput(text);
  const msgData = {
    senderId: user.id,
    senderName: sanitizeInput(user.name),
    text: safeText,
    status: "sent",
    createdAt: serverTimestamp()
  };
  await addDoc(collection(db, "conversations", conversationId, "messages"), msgData);
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: { text: safeText, senderId: user.id, senderName: sanitizeInput(user.name), status: "sent" },
    lastUpdated: serverTimestamp()
  });
};

export const markMessagesRead = async (conversationId, userId) => {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    where("senderId", "!=", userId),
    where("status", "==", "sent")
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { status: "read", readAt: serverTimestamp() }));
  await batch.commit();
};

export const subscribeConversation = (conversationId, callback) => {
  return onSnapshot(doc(db, "conversations", conversationId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, (e) => console.error("subscribeConversation error:", e));
};

export const setTyping = async (conversationId, userId, isTyping) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${userId}`]: isTyping
  });
};

// ── Notifications (realtime) ──

export const subscribeNotifications = (role, callback) => {
  const ref = role
    ? query(collection(db, "notifications"), where("targetRole", "in", [role, "all"]))
    : collection(db, "notifications");
  return onSnapshot(ref, (snap) => {
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const tA = a.createdAt?.toDate?.()?.getTime() || 0;
      const tB = b.createdAt?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });
    callback(data);
  }, (e) => console.error("subscribeNotifications error:", e));
};

export const subscribeMessages = (conversationId, callback) => {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (e) => console.error("subscribeMessages error:", e));
};

export const subscribeConversations = (userId, callback) => {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const tA = a.lastUpdated?.toDate?.()?.getTime() || 0;
      const tB = b.lastUpdated?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });
    callback(data);
  }, (e) => console.error("subscribeConversations error:", e));
};

// ── Activity Logging ──

export const logActivity = async (action, details = {}) => {
  try {
    const user = getStoredUser();
    await addDoc(collection(db, "activity"), {
      action,
      ...details,
      userId: user?.id || "anonymous",
      userName: user?.name || "Unknown",
      userRole: user?.role || "guest",
      timestamp: serverTimestamp(),
    });
  } catch {} // silent — never break UX for logging
};

export const pruneOldActivity = async (months = 3) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const q = query(collection(db, "activity"), where("timestamp", "<", Timestamp.fromDate(cutoff)));
    const snap = await getDocs(q);
    if (snap.empty) return 0;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(doc(db, "activity", d.id)));
    await batch.commit();
    return snap.docs.length;
  } catch (e) {
    console.error("pruneOldActivity error:", e);
    return 0;
  }
};

export const getActivities = async (limitCount = 100) => {
  const q = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getActivitiesPaginated = async (pageSize = 50, lastDoc = null) => {
  let q = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const newLastDoc = snap.docs[snap.docs.length - 1] || null;
  const hasMore = snap.docs.length === pageSize;
  return { items, lastDoc: newLastDoc, hasMore };
};

// ── Error Tracking ──

export const logError = async (error, context = {}) => {
  try {
    const user = getStoredUser();
    await addDoc(collection(db, "errors"), {
      message: error?.message || String(error),
      stack: error?.stack || "",
      ...context,
      url: window.location.href,
      userId: user?.id || "anonymous",
      userName: user?.name || "Unknown",
      userAgent: navigator.userAgent,
      resolved: false,
      timestamp: serverTimestamp(),
    });
  } catch {} // silent
};

export const getErrors = async (limitCount = 100) => {
  const q = query(collection(db, "errors"), orderBy("timestamp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getErrorsPaginated = async (pageSize = 50, lastDoc = null) => {
  let q = query(collection(db, "errors"), orderBy("timestamp", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const newLastDoc = snap.docs[snap.docs.length - 1] || null;
  const hasMore = snap.docs.length === pageSize;
  return { items, lastDoc: newLastDoc, hasMore };
};

export const markErrorResolved = async (errorId) => {
  await updateDoc(doc(db, "errors", errorId), { resolved: true });
};

export const pruneOldErrors = async (months = 3) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const q = query(collection(db, "errors"), where("timestamp", "<", Timestamp.fromDate(cutoff)));
    const snap = await getDocs(q);
    if (snap.empty) return 0;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(doc(db, "errors", d.id)));
    await batch.commit();
    return snap.docs.length;
  } catch (e) {
    console.error("pruneOldErrors error:", e);
    return 0;
  }
};

// ── Counselling Requests ──

export const getCounsellingRequests = async () => {
  const q = query(collection(db, "counsellingRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteCounsellingRequest = async (id) => {
  await deleteDoc(doc(db, "counsellingRequests", id));
};

// ── Sponsorship Requests ──

export const addSponsorshipRequest = async (data) => {
  const user = getStoredUser();
  const ref = await addDoc(collection(db, "sponsorshipRequests"), {
    ...sanitizeWrite(data),
    userId: user?.id || "",
    userName: sanitizeInput(user?.name || data.name || ""),
    userEmail: sanitizeInput(user?.email || data.email || ""),
    userPhone: sanitizeInput(user?.phone || data.phone || ""),
    userCity: sanitizeInput(user?.city || data.city || ""),
    userPhotoURL: user?.photoURL || data.photoURL || "",
    createdAt: serverTimestamp()
  });
  return ref.id;
};

export const getSponsorshipRequests = async () => {
  const q = query(collection(db, "sponsorshipRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteSponsorshipRequest = async (id) => {
  await deleteDoc(doc(db, "sponsorshipRequests", id));
};
