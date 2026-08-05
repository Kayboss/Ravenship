import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getAnalytics } from "../../firebase/db";
import { Card, CardTitle, StatGrid, StatCard, StatNum, StatLabel } from "./adminStyles";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import { logger } from "../../lib/logger";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getAnalytics().then(d => setData(d)).catch(e => logger.error("getAnalytics error:", e)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Card data-aos="fade-up"><LoadingSpinner label="Loading..." fullHeight /></Card>;
  return (
    <>
      <StatGrid data-aos="fade-up">
        <StatCard><StatNum>{data.total}</StatNum><StatLabel>Total Users</StatLabel></StatCard>
        <StatCard><StatNum>{data.mentors}</StatNum><StatLabel>Mentors</StatLabel></StatCard>
        <StatCard><StatNum>{data.mentees}</StatNum><StatLabel>Mentees</StatLabel></StatCard>
        <StatCard><StatNum>{data.admins}</StatNum><StatLabel>Admins</StatLabel></StatCard>
        <StatCard><StatNum>{data.verified}</StatNum><StatLabel>Verified</StatLabel></StatCard>
        <StatCard><StatNum>{data.pending}</StatNum><StatLabel>Pending Verification</StatLabel></StatCard>
      </StatGrid>
      <Card data-aos="fade-up">
        <CardTitle>📊 User Distribution</CardTitle>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[{ label: "Mentors", value: data.mentors, color: "#006590" }, { label: "Mentees", value: data.mentees, color: "#b50064" }, { label: "Admins", value: data.admins, color: "#ffd200" }].map(d => (
            <div key={d.label} style={{ flex: 1, minWidth: 120, textAlign: "center", padding: 20, background: "#f9f9f9", borderRadius: 16 }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: d.color }}>{d.value}</div>
              <div style={{ fontSize: "0.85rem", color: "#594048", marginTop: 4 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
