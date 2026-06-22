import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getCourses } from "../../firebase/db";
import { Badge, SectionBox } from "./adminStyles";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getCourses().then(d => setCourses(Array.isArray(d) ? d : [])).catch(e => console.error("getCourses error:", e));
  }, []);
  return (
    <>
    <style>{`
      .course-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;cursor:pointer;gap:12px}
      .course-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
      .course-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
      @media(max-width:480px){
        .course-header{flex-direction:column;align-items:flex-start;gap:10px;padding:14px 16px}
        .course-right{align-self:flex-start}
        .course-expand{position:absolute;right:16px;top:14px}
      }
    `}</style>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {courses.length === 0 ? <SectionBox data-aos="fade-up"><p style={{color:"#594048",fontSize:"0.85rem"}}>No courses yet.</p></SectionBox> : courses.map((c, i) => (
        <SectionBox key={c.id || i} data-aos="fade-up" data-aos-delay={i * 30} style={{padding:0,overflow:"hidden",position:"relative"}}>
          <div className="course-header"
            onClick={() => setExpandedCourse(expandedCourse === (c.id || i) ? null : (c.id || i))}>
            <div className="course-left">
              <span style={{fontSize:"1.8rem",flexShrink:0}}>{c.emoji || "📚"}</span>
              <div style={{minWidth:0}}>
                <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</h4>
                <span style={{fontSize:"0.78rem",color:"#594048",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{c.instructor} · {c.level || "N/A"} · {c.duration || "N/A"}</span>
              </div>
            </div>
            <div className="course-right">
              <Badge $c="#006590">{(c.enrolledMentees || c.enrolled || []).length} mentees</Badge>
              <Badge $c="#b50064">{c.assignments || 0} assignments</Badge>
              <span style={{fontSize:"0.8rem",color:"#999"}}>{expandedCourse === (c.id || i) ? "▲" : "▼"}</span>
            </div>
          </div>
          {expandedCourse === (c.id || i) && (
            <div style={{borderTop:"1px solid #e0e0e0",padding:"16px 24px"}}>
              <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:12}}>{c.fullDesc || c.desc || "No description."}</p>
              {c.syllabus?.length > 0 && (
                <div style={{marginBottom:12}}>
                  <p style={{fontSize:"0.8rem",fontWeight:700,color:"#2c3e50",marginBottom:6}}>📖 Syllabus ({c.syllabus.length} topics)</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{c.syllabus.map((t, j) => <Badge key={j} $c="#594048" style={{fontSize:"0.72rem"}}>{t}</Badge>)}</div>
                </div>
              )}
              <p style={{fontSize:"0.78rem",fontWeight:700,color:"#2c3e50",marginBottom:6}}>📝 Assignments ({c.assignments || 0})</p>
              {c.assignments > 0 ? (
                <p style={{fontSize:"0.78rem",color:"#594048"}}>Assignments configured for this course.</p>
              ) : (
                <p style={{fontSize:"0.78rem",color:"#999"}}>No assignments yet.</p>
              )}
            </div>
          )}
        </SectionBox>
      ))}
    </div>
    </>
  );
}
