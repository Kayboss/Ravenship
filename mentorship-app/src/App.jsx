import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { MyCourses } from "./pages/MyCourses.jsx";
import { MyMentees } from "./pages/MyMentees.jsx";
import { Assignments } from "./pages/Assignments.jsx";
import { Submissions } from "./pages/Submissions.jsx";
import { CourseView } from "./pages/CourseView.jsx";
import { Community } from "./pages/Community.jsx";
import { Analytics } from "./pages/Analytics.jsx";
import { Gradebook } from "./pages/Gradebook.jsx";
import { Settings } from "./pages/Settings.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { HelpCenter } from "./pages/HelpCenter.jsx";

const AppLayout = ({ children }) => {
  return <>{children}</>;
};

export const App = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard/:role" element={<Dashboard />} />
        <Route path="/dashboard/:role/my-courses" element={<MyCourses />} />
        <Route path="/dashboard/:role/my-mentees" element={<MyMentees />} />
        <Route path="/dashboard/:role/assignments" element={<Assignments />} />
        <Route path="/dashboard/:role/submissions" element={<Submissions />} />
        <Route path="/dashboard/:role/course/:title" element={<CourseView />} />
        <Route path="/dashboard/:role/community" element={<Community />} />
        <Route path="/dashboard/:role/analytics" element={<Analytics />} />
        <Route path="/dashboard/:role/gradebook" element={<Gradebook />} />
        <Route path="/dashboard/:role/settings" element={<Settings />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/:role/help" element={<HelpCenter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);
