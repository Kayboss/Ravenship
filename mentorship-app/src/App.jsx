import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
import { logError, trackSiteVisit } from "./firebase/db";
import { watchPresence, onAuthReady, getStoredUser } from "./firebase/auth";
import { getUser } from "./firebase/db";

const AuthGuard = ({ children, expectedRole }) => {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    onAuthReady(async () => {
      const stored = getStoredUser();
      if (!stored?.id) { setReady(true); setAllowed(false); return; }
      try {
        const fbUser = await getUser(stored.id);
        if (!fbUser || fbUser.deleted) { setAllowed(false); }
        else if (expectedRole && fbUser.role !== expectedRole) { setAllowed(false); }
        else if (!expectedRole && stored.role !== fbUser.role) { setAllowed(false); }
        else { setAllowed(true); }
      } catch { setAllowed(false); }
      setReady(true);
    });
  }, [expectedRole]);

  if (!ready) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return children;
};

const AuthGuardedRoute = ({ children }) => {
  const { role } = useParams();
  return <AuthGuard expectedRole={role}>{children}</AuthGuard>;
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
  useEffect(() => { watchPresence(); trackSiteVisit(); }, []);
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
          <Route path="/dashboard/:role" element={<AuthGuardedRoute><Dashboard /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/my-courses" element={<AuthGuardedRoute><MyCourses /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/my-mentees" element={<AuthGuardedRoute><MyMentees /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/assignments" element={<AuthGuardedRoute><Assignments /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/submissions" element={<AuthGuardedRoute><Submissions /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/course/:title" element={<AuthGuardedRoute><CourseView /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/community" element={<AuthGuardedRoute><Community /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/analytics" element={<AuthGuardedRoute><Analytics /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/gradebook" element={<AuthGuardedRoute><Gradebook /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/settings" element={<AuthGuardedRoute><Settings /></AuthGuardedRoute>} />
          <Route path="/dashboard/admin" element={<AuthGuard expectedRole="admin"><AdminLayout /></AuthGuard>}>
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
          <Route path="/dashboard/:role/help" element={<AuthGuardedRoute><HelpCenter /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/counselling-request" element={<AuthGuardedRoute><CounsellingRequest /></AuthGuardedRoute>} />
          <Route path="/dashboard/:role/sponsorship-request" element={<AuthGuardedRoute><SponsorshipRequest /></AuthGuardedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  </BrowserRouter>
);
