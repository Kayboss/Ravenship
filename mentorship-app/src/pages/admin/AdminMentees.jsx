import React, { useEffect, useState, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { getUsers, verifyUser, unverifyUser, getCourses, logActivity, updateUser, deleteUser, unenrollMentee } from "../../firebase/db";
import { sendApprovedEmail } from "../../lib/email";
import { Card, Badge, BioModal } from "./adminStyles";

export default function AdminMentees() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentee, setExpandedMentee] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  const loadData = useCallback(() => {
    Promise.all([
      getUsers().then(d => setUsers(Array.isArray(d) ? d.filter(u => u.role === "mentee" && !u.deleted) : [])),
      getCourses().then(d => setCourses(Array.isArray(d) ? d : [])),
      getDocs(collection(db, "enrollments")).then(snap => {
        const enrollments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnrollmentMap(enrollments);
      })
    ]).catch(e => console.error("loadData error:", e));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
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
  const doChangeRole = (id, newRole) => {
    const target = users.find(u => u.id === id);
    if (!target || !window.confirm(`Change ${target.name}'s role from "${target.role}" to "${newRole}"?`)) return;
    setVerifyMsg(null);
    updateUser(id, { role: newRole })
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
        logActivity("Role changed", { detail: `${target.name} changed from ${target.role} to ${newRole}` });
      })
      .catch(e => setVerifyMsg(e.message));
  };
  const doDelete = (id) => {
    const target = users.find(u => u.id === id);
    if (!target || !window.confirm(`⚠️ Remove ${target.name} from the platform? They will be marked as deleted and won't be able to log in.`)) return;
    setVerifyMsg(null);
    updateUser(id, { deleted: true, name: "Deleted User", email: "", phone: "", city: "", bio: "", photoURL: "", verified: false })
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
        logActivity("User deleted (soft)", { detail: `${target.name} (${target.role}) was removed from the platform` });
      })
      .catch(e => setVerifyMsg(e.message));
  };
  return (
    <>
    <style>{`
      .mentee-grid{max-width:100%;overflow:hidden}
      @media(max-width:768px){.mentee-grid{grid-template-columns:1fr !important}}
      .mentee-header{display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer;overflow:hidden}
      .mentee-info{display:flex;gap:16px;align-items:center;flex:1;min-width:0;overflow:hidden}
      .mentee-meta{display:flex;gap:8px;align-items:center;flex-shrink:0}
      .mentee-card{overflow:hidden;max-width:100%}
      .mentee-card h4,.mentee-card span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
      .course-detail{overflow:hidden;max-width:100%}
      .course-detail span{white-space:normal;word-break:break-word}
      .actions-dropdown{padding:8px 12px;border-radius:8px;border:1px solid #b50064;background:#fff;color:#b50064;font-weight:600;font-size:0.78rem;cursor:pointer;font-family:inherit;min-height:36px;width:100%}
      @media(max-width:480px){
        .mentee-header{flex-direction:column;gap:10px}
        .mentee-meta{align-self:flex-start}
      }
    `}</style>
    <div className="mentee-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {verifyMsg && <p style={{gridColumn:"1/-1",fontSize:"0.85rem",color:"#e53935",fontWeight:600,margin:0}}>{verifyMsg}</p>}
      {users.length === 0 ? <p style={{ gridColumn:"1/-1",color: "#594048", fontSize: "0.9rem" }}>No mentees registered.</p> : users.map((u) => {
        const enrolledTitles = enrollmentMap.filter(e => e.userId === u.id).map(e => e.courseTitle);
        const menteeCourses = courses.filter(c => (c.enrolledMentees || []).includes(u.id) || enrolledTitles.includes(c.title));
        return (
          <Card key={u.id} className="mentee-card" data-aos="fade-up" style={{marginBottom:0}}>
            <div className="mentee-header" onClick={() => setExpandedMentee(expandedMentee === u.id ? null : u.id)}>
              <div className="mentee-info">
                {u.photoURL ? (
                  <img src={u.photoURL} alt="" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                ) : (
                  <div style={{width:52,height:52,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                    {u.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                  </div>
                )}
                <div style={{minWidth:0}}>
                  <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</h4>
                  {u.phone && <span style={{fontSize:"0.8rem",color:"#594048",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>📞 {u.phone}</span>}
                </div>
              </div>
              <div className="mentee-meta">
                <Badge $c={u.verified ? "#2e7d32" : "#f57f17"}>{u.verified ? "✅ Verified" : "⏳ Pending"}</Badge>
                <span style={{fontSize:"0.75rem",color:"#999"}}>{menteeCourses.length} course{menteeCourses.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {expandedMentee === u.id && (
              <div style={{marginTop:16,borderTop:"1px solid #e0e0e0",paddingTop:16}}>
                <div style={{marginBottom:16}}>
                  <select className="actions-dropdown" value="" onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v === "bio") setBioUser(u); else if (v === "verify") doVerify(u.id, true); else if (v === "revoke") doVerify(u.id, false); else if (v === "mentor") doChangeRole(u.id, "mentor"); else if (v === "delete") doDelete(u.id); }}>
                    <option value="" disabled>Actions...</option>
                    <option value="bio">View Bio</option>
                    {u.verified ? <option value="revoke">Revoke</option> : <option value="verify">✓ Verify</option>}
                    <option value="mentor">Make Mentor</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>

                <p style={{fontSize:"0.9rem",fontWeight:600,color:"#2c3e50",marginBottom:12}}>📚 Enrolled Courses ({menteeCourses.length})</p>
                {menteeCourses.length === 0 ? (
                  <p style={{fontSize:"0.8rem",color:"#999"}}>This mentee is not enrolled in any courses.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {menteeCourses.map(c => (
                      <div key={c.id} style={{border:"1px solid #e0e0e0",borderRadius:12,overflow:"hidden"}}>
                        <div className="course-detail" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f9f9f9",cursor:"pointer"}}
                          onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                          <div style={{overflow:"hidden"}}>
                            <strong style={{fontSize:"0.9rem",color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{c.title}</strong>
                            <span style={{fontSize:"0.78rem",color:"#594048"}}>{c.badge} · {c.level} · {c.duration} · {c.instructor}</span>
                          </div>
                        </div>
                        {expandedCourse === c.id && (
                          <div style={{padding:"12px 16px",borderTop:"1px solid #e0e0e0"}}>
                            <p style={{fontSize:"0.8rem",fontWeight:600,color:"#2c3e50",marginBottom:6}}>Course Details</p>
                            <p style={{fontSize:"0.78rem",color:"#594048"}}>Instructor: {c.instructor} · Level: {c.level} · Duration: {c.duration}</p>
                            <button onClick={async () => { if (confirm(`Remove ${u.name} from "${c.title}"?`)) { try { await unenrollMentee(c.id, u.id); setExpandedCourse(null); } catch (e) { alert(e.message); } } }} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:"1px solid #e53935",background:"transparent",color:"#e53935",fontFamily:"inherit",fontWeight:600,fontSize:"0.78rem",cursor:"pointer"}}>Unenroll</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
    <BioModal user={bioUser} onClose={() => setBioUser(null)} />
    </>
  );
}
