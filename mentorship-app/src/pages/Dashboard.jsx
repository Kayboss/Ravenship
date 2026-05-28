import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { MenteeDashboard } from "./MenteeDashboard.jsx";
import { MentorDashboard } from "./MentorDashboard.jsx";

export const Dashboard = () => {
  const { role } = useParams();

  switch (role) {
    case "mentee":
      return <MenteeDashboard />;
    case "mentor":
      return <MentorDashboard />;
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};
