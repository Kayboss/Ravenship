import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { onAuthReady } from "../../firebase/auth";
import { AdminSidebar } from "../../components/layout/AdminSidebar.jsx";
import { TopBar } from "../../components/layout/TopBar.jsx";
import { AdminPageLayout, AdminPageMain } from "./adminStyles";

export default function AdminLayout() {
  const [authOk, setAuthOk] = useState(false);
  const [theme, setTheme] = useState("dark");
  useEffect(() => { onAuthReady(() => setAuthOk(true)); }, []);
  if (!authOk) return null;
  return (
    <AdminPageLayout>
      <AdminSidebar />
      <AdminPageMain>
        <TopBar theme={theme} setTheme={setTheme} />
        <Outlet />
      </AdminPageMain>
    </AdminPageLayout>
  );
}
