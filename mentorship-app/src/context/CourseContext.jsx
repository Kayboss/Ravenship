import React, { createContext, useContext, useState, useCallback } from "react";

const CourseContext = createContext({
  enrolledCourses: {},
  enrollCourse: () => {},
  updateProgress: () => {},
});

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    const saved = localStorage.getItem("enrolledCourses");
    return saved ? JSON.parse(saved) : {};
  });

  const enrollCourse = useCallback((title) => {
    setEnrolledCourses((prev) => {
      if (prev[title]) return prev;
      const next = { ...prev, [title]: { started: true, startedAt: new Date().toISOString(), progress: 0 } };
      localStorage.setItem("enrolledCourses", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProgress = useCallback((title, topicIndex, totalTopics) => {
    setEnrolledCourses((prev) => {
      const prog = Math.round(((topicIndex + 1) / totalTopics) * 100);
      const next = { ...prev, [title]: { ...prev[title], progress: prog, lastTopic: topicIndex } };
      localStorage.setItem("enrolledCourses", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <CourseContext.Provider value={{ enrolledCourses, enrollCourse, updateProgress }}>
      {children}
    </CourseContext.Provider>
  );
};
