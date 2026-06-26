import React from "react";
import { useParams } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar.jsx";
import { MentorSidebar } from "./MentorSidebar.jsx";
import { MenteeSidebar } from "./MenteeSidebar.jsx";
import { getStoredUser } from "../../firebase/auth";

export const SidebarByRole = () => {
  const { role } = useParams();
  const user = getStoredUser();
  const actualRole = user?.role;
  const effectiveRole = actualRole && role !== actualRole ? actualRole : role;
  if (effectiveRole === "mentor") return <MentorSidebar />;
  if (effectiveRole === "mentee") return <MenteeSidebar />;
  return <AdminSidebar />;
};
