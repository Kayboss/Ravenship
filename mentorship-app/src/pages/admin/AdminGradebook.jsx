import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getAllGradebook, getUsers, getCourses } from "../../firebase/db";
import { Card, CardTitle, Badge, Table, Th, Td } from "./adminStyles";

export default function AdminGradebook() {
  const [mentees, setMentees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    setLoading(true);
    getAllGradebook()
      .then(entries => {
        return getUsers().then(users => {
          return entries.map(e => {
            const user = users.find(u => u.id === e.menteeId);
            const scores = e.scores || {};
            const vals = Object.values(scores).filter(v => typeof v === 'number');
            const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return { name: user?.name || e.menteeId || "Unknown", scores, avg };
          });
        });
      })
      .then(setMentees)
      .catch(() => {})
      .finally(() => setLoading(false));
    getCourses().then(courses => {
      const names = [...new Set(courses.flatMap(c => c.assignments ? (typeof c.assignments === 'number' ? [] : c.assignments) : []))];
      setAssignments(names.length ? names : ["Assignment 1", "Assignment 2", "Assignment 3", "Assignment 4", "Assignment 5"]);
    }).catch(() => setAssignments(["Assignment 1", "Assignment 2", "Assignment 3", "Assignment 4", "Assignment 5"]));
  }, []);
  const total = mentees.length;
  const passing = mentees.filter(m => m.avg >= 60).length;
  const avg = Math.round(mentees.reduce((s, m) => s + m.avg, 0) / (total || 1));
  return (
    <Card data-aos="fade-up">
      <CardTitle>📋 All Submissions & Grades</CardTitle>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[["👥 Total", total, "#594048"], ["📊 Avg Grade", `${avg}%`, "#b50064"], ["✅ Passing", passing, "#2e7d32"], ["❌ Failing", mentees.filter(m => m.avg < 60).length, "#e53935"]].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, minWidth: 100, padding: "12px 16px", background: "#f9f9f9", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#594048", fontWeight: 600 }}>{l}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:480px){.gb-table{display:none}.gb-cards{display:flex}}`}</style>
      <div className="gb-table" style={{ overflowX: "auto" }}>
        <Table><thead><tr><Th>Mentee</Th>{assignments.map(a => <Th key={a}>{a}</Th>)}<Th>Avg</Th><Th>Status</Th></tr></thead>
        <tbody>{mentees.map((m, i) => (
          <tr key={i}>{[<Td key="n"><strong>{m.name}</strong></Td>, ...assignments.map(a => (
            <Td key={a}>{m.scores[a] !== undefined ? <Badge $c={m.scores[a] >= 80 ? "#2e7d32" : m.scores[a] >= 60 ? "#f57f17" : "#e53935"}>{m.scores[a]}</Badge> : <span style={{ color: "#ccc" }}>—</span>}</Td>
          )), <Td key="avg"><Badge $c={m.avg >= 80 ? "#2e7d32" : m.avg >= 60 ? "#f57f17" : "#e53935"}>{m.avg}%</Badge></Td>, <Td key="s"><Badge $c={m.avg >= 60 ? "#2e7d32" : "#e53935"}>{m.avg >= 60 ? "✅ Passing" : "❌ Failing"}</Badge></Td>]}</tr>
        ))}</tbody></Table>
      </div>
      <div className="gb-cards" style={{ display: "none", flexDirection: "column", gap: 12 }}>
        {mentees.map((m, i) => (
          <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <strong style={{ fontSize: "0.9rem" }}>{m.name}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge $c={m.avg >= 80 ? "#2e7d32" : m.avg >= 60 ? "#f57f17" : "#e53935"} style={{ fontSize: "0.78rem" }}>{m.avg}%</Badge>
                <Badge $c={m.avg >= 60 ? "#2e7d32" : "#e53935"} style={{ fontSize: "0.7rem" }}>{m.avg >= 60 ? "✅" : "❌"}</Badge>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {assignments.map(a => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}>
                  <span style={{ color: "#594048" }}>{a}:</span>
                  {m.scores[a] !== undefined ? (
                    <Badge $c={m.scores[a] >= 80 ? "#2e7d32" : m.scores[a] >= 60 ? "#f57f17" : "#e53935"} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>{m.scores[a]}</Badge>
                  ) : <span style={{ color: "#ccc" }}>—</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
