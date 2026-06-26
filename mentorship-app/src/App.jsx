import React, { useEffect, useState } from "react";
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
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminMentors from "./pages/admin/AdminMentors.jsx";
import AdminMentees from "./pages/admin/AdminMentees.jsx";
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard.jsx";
import AdminGradebook from "./pages/admin/AdminGradebook.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminMentorship from "./pages/admin/AdminMentorship.jsx";
import AdminHelpCenter from "./pages/admin/AdminHelpCenter.jsx";
import AdminActivity from "./pages/admin/AdminActivity.jsx";
import AdminErrors from "./pages/admin/AdminErrors.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import { HelpCenter } from "./pages/HelpCenter.jsx";
import { CounsellingRequest } from "./pages/CounsellingRequest.jsx";
import { SponsorshipRequest } from "./pages/SponsorshipRequest.jsx";
import { logError } from "./firebase/db";
import { watchPresence, onAuthReady, getStoredUser } from "./firebase/auth";

const AuthGuard = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    onAuthReady(() => {
      setReady(true);
      setHasUser(!!getStoredUser());
    });
  }, []);

  if (!ready) return null;
  if (!hasUser) return <Navigate to="/" replace />;
  return children;
};

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
  useEffect(() => { watchPresence(); }, []);
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
          <Route path="/dashboard/:role" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/dashboard/:role/my-courses" element={<AuthGuard><MyCourses /></AuthGuard>} />
          <Route path="/dashboard/:role/my-mentees" element={<AuthGuard><MyMentees /></AuthGuard>} />
          <Route path="/dashboard/:role/assignments" element={<AuthGuard><Assignments /></AuthGuard>} />
          <Route path="/dashboard/:role/submissions" element={<AuthGuard><Submissions /></AuthGuard>} />
          <Route path="/dashboard/:role/course/:title" element={<AuthGuard><CourseView /></AuthGuard>} />
          <Route path="/dashboard/:role/community" element={<AuthGuard><Community /></AuthGuard>} />
          <Route path="/dashboard/:role/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/dashboard/:role/gradebook" element={<AuthGuard><Gradebook /></AuthGuard>} />
          <Route path="/dashboard/:role/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/dashboard/admin" element={<AuthGuard><AdminLayout /></AuthGuard>}>
            <Route index element={<AdminOverview />} />
            <Route path="mentors" element={<AdminMentors />} />
            <Route path="mentees" element={<AdminMentees />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="leaderboard" element={<AdminLeaderboard />} />
            <Route path="gradebook" element={<AdminGradebook />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="mentorship" element={<AdminMentorship />} />
            <Route path="help" element={<AdminHelpCenter />} />
            <Route path="activity" element={<AdminActivity />} />
            <Route path="errors" element={<AdminErrors />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          <Route path="/dashboard/:role/help" element={<AuthGuard><HelpCenter /></AuthGuard>} />
          <Route path="/dashboard/:role/counselling-request" element={<AuthGuard><CounsellingRequest /></AuthGuard>} />
          <Route path="/dashboard/:role/sponsorship-request" element={<AuthGuard><SponsorshipRequest /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  </BrowserRouter>
);
