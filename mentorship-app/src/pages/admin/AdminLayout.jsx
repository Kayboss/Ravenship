import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../components/layout/AdminSidebar.jsx";
import { TopBar } from "../../components/layout/TopBar.jsx";
import { AdminPageLayout, AdminPageMain } from "./adminStyles";

export default function AdminLayout() {
  const [theme, setTheme] = useState("dark");
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
