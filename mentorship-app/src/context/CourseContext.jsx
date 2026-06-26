import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getEnrollments, setEnrollment, deleteEnrollment } from "../firebase/db";
import { getStoredUser } from "../firebase/auth";

const CourseContext = createContext({
  enrolledCourses: {},
  enrollCourse: () => {},
  updateProgress: () => {},
  saveProgress: () => {},
  removeEnrollment: () => {},
});

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [enrolledCourses, setEnrolledCourses] = useState({});

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) return;
    getEnrollments(user.id).then(fireEnrollments => {
      if (Object.keys(fireEnrollments).length > 0) {
        setEnrolledCourses(fireEnrollments);
      }
    }).catch(e => console.error("getEnrollments error:", e));
  }, []);

  const syncToFirestore = useCallback((title, data) => {
    const user = getStoredUser();
    if (!user?.id) return;
    setEnrollment(user.id, title, {
      startedAt: data.startedAt || new Date().toISOString(),
      progress: data.progress ?? 0,
      lastTopic: data.lastTopic ?? 0,
      completedLessons: data.completedLessons || [],
    }).catch(e => console.error("setEnrollment error:", e));
  }, []);

  const enrollCourse = useCallback((title) => {
    setEnrolledCourses((prev) => {
      if (prev[title]) return prev;
      const entry = { started: true, startedAt: new Date().toISOString(), progress: 0 };
      syncToFirestore(title, entry);
      return { ...prev, [title]: entry };
    });
  }, [syncToFirestore]);

  const updateProgress = useCallback((title, topicIndex) => {
    setEnrolledCourses((prev) => {
      const current = prev[title] || {};
      const entry = { ...current, lastTopic: topicIndex };
      syncToFirestore(title, entry);
      return { ...prev, [title]: entry };
    });
  }, [syncToFirestore]);

  const saveProgress = useCallback((title, topicIndex, completedLessons, totalTopics) => {
    const prog = totalTopics > 0 ? Math.round((completedLessons.length / totalTopics) * 100) : 0;
    setEnrolledCourses((prev) => {
      const current = prev[title] || {};
      const entry = { ...current, progress: prog, lastTopic: topicIndex, completedLessons };
      syncToFirestore(title, entry);
      return { ...prev, [title]: entry };
    });
  }, [syncToFirestore]);

  const removeEnrollment = useCallback((title) => {
    setEnrolledCourses((prev) => {
      const next = { ...prev };
      delete next[title];
      return next;
    });
    const user = getStoredUser();
    if (user?.id) {
      deleteEnrollment(user.id, title).catch(e => console.error("deleteEnrollment error:", e));
    }
  }, []);

  return (
    <CourseContext.Provider value={{ enrolledCourses, enrollCourse, updateProgress, saveProgress, removeEnrollment }}>
      {children}
    </CourseContext.Provider>
  );
};