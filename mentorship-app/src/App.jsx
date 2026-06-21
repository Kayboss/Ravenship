import React, { useEffect } from "react";
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
import { CounsellingRequest } from "./pages/CounsellingRequest.jsx";
import { logError } from "./firebase/db";

const AppLayout = ({ children }) => {
  return <>{children}</>;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    logError(error, { componentStack: errorInfo?.componentStack || "" });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16,fontFamily:"sans-serif",padding:40,textAlign:"center"}}>
          <h2 style={{color:"#b50064",margin:0}}>Something went wrong</h2>
          <p style={{color:"#594048",maxWidth:400}}>An unexpected error occurred. It has been logged and will be reviewed by the team.</p>
          <button onClick={() => window.location.reload()} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"#b50064",color:"#fff",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const GlobalErrorLogger = () => {
  useEffect(() => {
    const onError = (event) => {
      logError(event.error || event.message, { type: "window.onerror" });
    };
    const onRejection = (event) => {
      logError(event.reason, { type: "unhandledrejection" });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
};

export const App = () => (
  <BrowserRouter>
    <GlobalErrorLogger />
    <ErrorBoundary>
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
          <Route path="/dashboard/:role/counselling-request" element={<CounsellingRequest />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  </BrowserRouter>
);
