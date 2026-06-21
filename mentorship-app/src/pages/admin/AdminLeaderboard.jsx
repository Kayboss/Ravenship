import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getUsers, getCourses } from "../../firebase/db";
import { Badge, SectionBox, SectionBoxTitle, RankRow, RankNum } from "./adminStyles";

export default function AdminLeaderboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getUsers().then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    getCourses().then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const mentors = users.filter(u => u.role === "mentor");
  const mentees = users.filter(u => u.role === "mentee");
  const topMentors = [...mentors].sort((a, b) => (b.courseCount || courses.filter(c => c.instructor?.toLowerCase() === b.name?.toLowerCase()).length) - (a.courseCount || courses.filter(c => c.instructor?.toLowerCase() === a.name?.toLowerCase()).length)).slice(0, 5);
  const topMentees = [...mentees].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0)).slice(0, 5);
  const topCourses = [...courses].sort((a, b) => ((b.enrolledMentees || b.enrolled || []).length) - ((a.enrolledMentees || a.enrolled || []).length)).slice(0, 5);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
      <SectionBox data-aos="fade-up">
        <SectionBoxTitle>🏆 Top 5 Mentors</SectionBoxTitle>
        {topMentors.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No mentors yet.</p> : topMentors.map((m, i) => (
          <RankRow key={m.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#006590"}>{i + 1}</RankNum>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#006590",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,color:"#fff",flexShrink:0}}>{m.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{m.name}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>{courses.filter(c => c.instructor?.toLowerCase() === m.name?.toLowerCase()).length} courses</span></div>
            <Badge $c="#006590">{m.verified ? "Verified" : "Pending"}</Badge>
          </RankRow>
        ))}
      </SectionBox>
      <SectionBox data-aos="fade-up" data-aos-delay="100">
        <SectionBoxTitle>🏆 Top 5 Mentees</SectionBoxTitle>
        {topMentees.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No mentees yet.</p> : topMentees.map((m, i) => (
          <RankRow key={m.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#b50064"}>{i + 1}</RankNum>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,color:"#fff",flexShrink:0}}>{m.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{m.name}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>{m.verified ? "Verified" : "Pending verification"}</span></div>
            <Badge $c={m.verified ? "#2e7d32" : "#f57f17"}>{m.verified ? "Verified" : "Pending"}</Badge>
          </RankRow>
        ))}
      </SectionBox>
      <SectionBox data-aos="fade-up" data-aos-delay="200">
        <SectionBoxTitle>🏆 Top 5 Courses</SectionBoxTitle>
        {topCourses.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No courses yet.</p> : topCourses.map((c, i) => (
          <RankRow key={c.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#cca800"}>{i + 1}</RankNum>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{c.title}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>{c.instructor} · {c.level} · {(c.enrolledMentees || c.enrolled || []).length} enrolled</span></div>
            <Badge $c="#27AE60">{(c.enrolledMentees || c.enrolled || []).length} mentees</Badge>
          </RankRow>
        ))}
      </SectionBox>
    </div>
  );
}
