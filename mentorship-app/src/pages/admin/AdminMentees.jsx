import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getUsers, verifyUser, unverifyUser, getCourses, logActivity } from "../../firebase/db";
import { sendApprovedEmail } from "../../lib/email";
import { Card, Badge, Btn, BioModal } from "./adminStyles";

export default function AdminMentees() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentee, setExpandedMentee] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getUsers().then(d => setUsers(Array.isArray(d) ? d.filter(u => u.role === "mentee") : [])).catch(() => {});
    getCourses().then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const doVerify = (id, v) => {
    setVerifying(id);
    setVerifyMsg(null);
    const target = users.find(u => u.id === id);
    const action = v ? verifyUser(id) : unverifyUser(id);
    action
      .then(() => { setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: v } : u)); setVerifyMsg(null); })
      .then(() => {
        if (target) logActivity("User " + (v ? "verified" : "unverified"), { detail: `${target.name} (${target.role}) was ${v ? "verified" : "unverified"}` });
        if (v && target) sendApprovedEmail({ name: target.name, email: target.email, role: target.role });
      })
      .catch(e => setVerifyMsg(e.message))
      .finally(() => setVerifying(null));
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {verifyMsg && <p style={{gridColumn:"1/-1",fontSize:"0.85rem",color:"#e53935",fontWeight:600,margin:0}}>{verifyMsg}</p>}
      {users.length === 0 ? <p style={{ gridColumn:"1/-1",color: "#594048", fontSize: "0.9rem" }}>No mentees registered.</p> : users.map((u) => {
        const menteeCourses = courses.filter(c => (c.enrolledMentees || c.enrolled || []).some(e => e.userId === u.id || e.email === u.email));
        return (
          <Card key={u.id} data-aos="fade-up" style={{marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",cursor:"pointer"}} onClick={() => setExpandedMentee(expandedMentee === u.id ? null : u.id)}>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                  {u.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                </div>
                <div>
                  <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50"}}>{u.name}</h4>
                  <span style={{fontSize:"0.8rem",color:"#594048"}}>{u.email}{u.phone ? ` · ${u.phone}` : ""}{u.city ? ` · ${u.city}` : ""}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                <Badge $c={u.verified ? "#2e7d32" : "#f57f17"}>{u.verified ? "✅ Verified" : "⏳ Pending"}</Badge>
                <span style={{fontSize:"0.75rem",color:"#999"}}>{menteeCourses.length} course{menteeCourses.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {expandedMentee === u.id && (
              <div style={{marginTop:16,borderTop:"1px solid #e0e0e0",paddingTop:16}}>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  <Btn $outline onClick={() => setBioUser(u)}>View Bio</Btn>
                  {u.verified ? <Btn $outline disabled={verifying === u.id} onClick={() => doVerify(u.id, false)}>{verifying === u.id ? "Revoking..." : "Revoke"}</Btn> : <Btn disabled={verifying === u.id} onClick={() => doVerify(u.id, true)}>{verifying === u.id ? "Verifying..." : "✓ Verify"}</Btn>}
                </div>

                <p style={{fontSize:"0.9rem",fontWeight:600,color:"#2c3e50",marginBottom:12}}>📚 Enrolled Courses ({menteeCourses.length})</p>
                {menteeCourses.length === 0 ? (
                  <p style={{fontSize:"0.8rem",color:"#999"}}>This mentee is not enrolled in any courses.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {menteeCourses.map(c => (
                      <div key={c.id} style={{border:"1px solid #e0e0e0",borderRadius:12,overflow:"hidden"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f9f9f9",cursor:"pointer"}}
                          onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                          <div>
                            <strong style={{fontSize:"0.9rem",color:"#2c3e50"}}>{c.title}</strong>
                            <span style={{fontSize:"0.78rem",color:"#594048",marginLeft:8}}>{c.badge} · {c.level} · {c.duration} · {c.instructor}</span>
                          </div>
                        </div>
                        {expandedCourse === c.id && (
                          <div style={{padding:"12px 16px",borderTop:"1px solid #e0e0e0"}}>
                            <p style={{fontSize:"0.8rem",fontWeight:600,color:"#2c3e50",marginBottom:6}}>Course Details</p>
                            <p style={{fontSize:"0.78rem",color:"#594048"}}>Instructor: {c.instructor} · Level: {c.level} · Duration: {c.duration}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <BioModal user={bioUser} onClose={() => setBioUser(null)} />
          </Card>
        );
      })}
    </div>
  );
}
