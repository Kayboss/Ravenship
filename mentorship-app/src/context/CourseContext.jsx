import React, { createContext, useContext, useState, useCallback } from "react";

const CourseContext = createContext({
  enrolledCourses: {},
  enrollCourse: () => {},
  updateProgress: () => {},
});

export const useCourses = () => useContext(CourseContext);

const defaultProgress = {
  "Advanced UI/UX Systems": { progress: 75 },
  "Strategic Data Insights": { progress: 40 },
  "Design Thinking Fundamentals": { progress: 92 },
  "Full-Stack Web Development": { progress: 60 },
  "Product Management 101": { progress: 15 },
  "Creative Brand Strategy": { progress: 55 },
};

export const CourseProvider = ({ children }) => {
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    const saved = localStorage.getItem("enrolledCourses");
    return saved ? JSON.parse(saved) : {};
  });

  const enrollCourse = useCallback((title) => {
    setEnrolledCourses((prev) => {
      if (prev[title]) return prev;
      const next = { ...prev, [title]: { started: true, startedAt: new Date().toISOString(), ...defaultProgress[title] } };
      localStorage.setItem("enrolledCourses", JSON.stringify(next));
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      if (token) {
        const courseId = "c" + ([
          "Advanced UI/UX Systems",
          "Strategic Data Insights",
          "Design Thinking Fundamentals",
          "Full-Stack Web Development",
          "Product Management 101",
          "Creative Brand Strategy",
        ].indexOf(title) + 1);
        if (courseId !== "c0") {
          fetch("/api/courses/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ courseId, userName: user.name }),
          }).catch(() => {});
        }
      }
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
