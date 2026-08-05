import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getEnrollments, setEnrollment, deleteEnrollment, getUser, getCourses } from "../firebase/db";
import { getStoredUser } from "../firebase/auth";
import { logger } from "../lib/logger";

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
    (async () => {
      const user = getStoredUser();
      if (!user?.id) return;
      const u = await getUser(user.id).catch(() => null);
      const mentorId = u?.mentorId || null;
      const fireEnrollments = await getEnrollments(user.id).catch(() => ({}));
      if (mentorId) {
        const mentorCourses = await getCourses(mentorId).catch(() => []);
        const validTitles = new Set(mentorCourses.map(c => c.title));
        const filtered = {};
        for (const [title, data] of Object.entries(fireEnrollments)) {
          if (validTitles.has(title)) {
            filtered[title] = data;
          } else {
            deleteEnrollment(user.id, title).catch(() => {});
          }
        }
        if (Object.keys(filtered).length > 0) {
          setEnrolledCourses(filtered);
        }
      } else {
        setEnrolledCourses(fireEnrollments);
      }
    })();
  }, []);

  const syncToFirestore = useCallback((title, data) => {
    const user = getStoredUser();
    if (!user?.id) return;
    setEnrollment(user.id, title, {
      ...data,
      startedAt: data.startedAt || new Date().toISOString(),
      progress: data.progress ?? 0,
      lastTopic: data.lastTopic ?? 0,
    }).catch(e => logger.error("setEnrollment error:", e));
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
    const completed = totalTopics > 0 && completedLessons.length >= totalTopics;
    setEnrolledCourses((prev) => {
      const current = prev[title] || {};
      const entry = { ...current, progress: prog, lastTopic: topicIndex, completedLessons };
      if (completed) { entry.completed = true; entry.completedAt = new Date().toISOString(); }
      else { delete entry.completed; delete entry.completedAt; }
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
      deleteEnrollment(user.id, title).catch(e => logger.error("deleteEnrollment error:", e));
    }
  }, []);

  return (
    <CourseContext.Provider value={{ enrolledCourses, enrollCourse, updateProgress, saveProgress, removeEnrollment }}>
      {children}
    </CourseContext.Provider>
  );
};