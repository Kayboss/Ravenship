import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AdminSidebar } from "../../components/layout/AdminSidebar.jsx";
import { TopBar } from "../../components/layout/TopBar.jsx";
import { AdminPageLayout, AdminPageMain } from "./adminStyles";
import { getStoredUser } from "../../firebase/auth";
import { getBillingStatus } from "../../firebase/db";

export default function AdminLayout() {
  const [theme, setTheme] = useState("dark");
  const [billingExpired, setBillingExpired] = useState(false);
  const navigate = useNavigate();
  const user = getStoredUser();

  const location = useLocation();

  useEffect(() => {
    if (!user?.id) return;
    getBillingStatus(user.id)
      .then(billing => {
        if (!billing || billing.status !== "verified") {
          setBillingExpired(true);
          return;
        }
        if (billing.expiryDate) {
          const expiry = billing.expiryDate?.toDate ? billing.expiryDate.toDate() : new Date(billing.expiryDate);
          if (expiry < new Date()) {
            setBillingExpired(true);
          } else {
            setBillingExpired(false);
          }
        } else {
          setBillingExpired(false);
        }
      })
      .catch(() => {});
  }, [user?.id, location.pathname]);

  return (
    <AdminPageLayout>
      <AdminSidebar />
      <AdminPageMain>
        {billingExpired && (
          <div style={{ padding: "12px 20px", background: "#fff3cd", borderBottom: "1px solid #ffc107", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem" }}>⚠️</span>
              <span style={{ color: "#856404", fontSize: "0.85rem", fontWeight: 600 }}>Your subscription has expired or is pending. </span>
              <span style={{ color: "#856404", fontSize: "0.85rem" }}>Mentors and mentees cannot access the platform.</span>
            </div>
            <button onClick={() => navigate("/dashboard/admin/billing")} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #856404", background: "transparent", color: "#856404", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Renew Now
            </button>
          </div>
        )}
        <TopBar theme={theme} setTheme={setTheme} />
        <Outlet />
      </AdminPageMain>
    </AdminPageLayout>
  );
}
