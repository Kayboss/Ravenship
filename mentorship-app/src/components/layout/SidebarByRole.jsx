import React from "react";
import { useParams } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar.jsx";
import { MentorSidebar } from "./MentorSidebar.jsx";
import { MenteeSidebar } from "./MenteeSidebar.jsx";

export const SidebarByRole = () => {
  const { role } = useParams();
  if (role === "mentor") return <MentorSidebar />;
  if (role === "mentee") return <MenteeSidebar />;
  return <AdminSidebar />;
};
