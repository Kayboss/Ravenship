import React, { useEffect, useState, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { getUsers, verifyUser, unverifyUser, getCourses, logActivity, updateUser, deleteUser } from "../../firebase/db";
import { sendApprovedEmail } from "../../lib/email";
import { Card, Badge, Table, Th, Td, BioModal } from "./adminStyles";

export default function AdminMentors() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentor, setExpandedMentor] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  const loadData = useCallback(() => {
    Promise.all([
      getUsers().then(d => {
        const arr = Array.isArray(d) ? d : [];
        setAllUsers(arr);
        setUsers(arr.filter(u => u.role === "mentor" && !u.deleted));
      }),
      getCourses().then(d => setCourses(Array.isArray(d) ? d : [])),
      getDocs(collection(db, "enrollments")).then(snap => {
        setEnrollmentMap(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      })
    ]).catch(e => console.error("loadData error:", e));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  const resolveMentees = (ids) => ids.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
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
      .mentor-grid{max-width:100%;overflow:hidden}
      @media(max-width:768px){.mentor-grid{grid-template-columns:1fr !important}}
      .mentor-header{display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer;overflow:hidden}
      .mentor-info{display:flex;gap:16px;align-items:center;flex:1;min-width:0;overflow:hidden}
      .mentor-meta{display:flex;gap:8px;align-items:center;flex-shrink:0}
      .mentor-card{overflow:hidden;max-width:100%}
      .mentor-card h4,.mentor-card span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
      .course-detail{overflow:hidden;max-width:100%}
      .course-detail span{white-space:normal;word-break:break-word}
      .actions-dropdown{padding:8px 12px;border-radius:8px;border:1px solid #b50064;background:#fff;color:#b50064;font-weight:600;font-size:0.78rem;cursor:pointer;font-family:inherit;min-height:36px;width:100%}
      @media(max-width:480px){
        .mentor-header{flex-direction:column;gap:10px}
        .mentor-meta{align-self:flex-start}
      }
    `}</style>
    <div className="mentor-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {verifyMsg && <p style={{gridColumn:"1/-1",fontSize:"0.85rem",color:"#e53935",fontWeight:600,margin:0}}>{verifyMsg}</p>}
      {users.length === 0 ? <p style={{ color: "#594048", fontSize: "0.9rem", gridColumn:"1/-1" }}>No mentors registered.</p> : users.map((u, idx) => {
        const mentorCourses = courses.filter(c => c.createdBy === u.id);
        return (
          <Card key={u.id} className="mentor-card" data-aos="fade-up" style={{marginBottom:0}}>
            <div className="mentor-header" onClick={() => setExpandedMentor(expandedMentor === u.id ? null : u.id)}>
              <div className="mentor-info">
                {u.photoURL ? (
                  <img src={u.photoURL} alt="" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                ) : (
                  <div style={{width:52,height:52,borderRadius:"50%",background:"#006590",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                    {u.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                  </div>
                )}
                <div style={{minWidth:0}}>
                  <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</h4>
                  {u.phone && <span style={{fontSize:"0.8rem",color:"#594048",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>📞 {u.phone}</span>}
                </div>
              </div>
              <div className="mentor-meta">
                <Badge $c={u.verified ? "#2e7d32" : "#f57f17"}>{u.verified ? "✅ Verified" : "⏳ Pending"}</Badge>
                <span style={{fontSize:"0.75rem",color:"#999"}}>{mentorCourses.length} course{mentorCourses.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {expandedMentor === u.id && (
              <div style={{marginTop:16,borderTop:"1px solid #e0e0e0",paddingTop:16}}>
                <div style={{marginBottom:16}}>
                  <select className="actions-dropdown" value="" onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v === "bio") setBioUser(u); else if (v === "verify") doVerify(u.id, true); else if (v === "revoke") doVerify(u.id, false); else if (v === "mentee") doChangeRole(u.id, "mentee"); else if (v === "delete") doDelete(u.id); }}>
                    <option value="" disabled>Actions...</option>
                    <option value="bio">View Bio</option>
                    {u.verified ? <option value="revoke">Revoke</option> : <option value="verify">✓ Verify</option>}
                    <option value="mentee">Make Mentee</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>

                <p style={{fontSize:"0.9rem",fontWeight:600,color:"#2c3e50",marginBottom:12}}>📚 Courses ({mentorCourses.length})</p>
                {mentorCourses.length === 0 ? (
                  <p style={{fontSize:"0.8rem",color:"#999"}}>This mentor has no courses yet.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {mentorCourses.map(c => (
                      <div key={c.id} style={{border:"1px solid #e0e0e0",borderRadius:12,overflow:"hidden"}}>
                        <div className="course-detail" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f9f9f9",cursor:"pointer"}}
                          onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                          <div style={{overflow:"hidden"}}>
                            <strong style={{fontSize:"0.9rem",color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{c.title}</strong>
                            <span style={{fontSize:"0.78rem",color:"#594048"}}>{c.badge} · {c.level} · {c.duration}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <span style={{fontWeight:700,fontSize:"1rem",color:"#b50064"}}>{(() => {
                              const byArray = (c.enrolledMentees || []).length;
                              const byEnrollments = enrollmentMap.filter(e => e.courseTitle === c.title).length;
                              return Math.max(byArray, byEnrollments);
                            })()}</span>
                            <span style={{fontSize:"0.72rem",color:"#594048",display:"block"}}>mentees</span>
                          </div>
                        </div>
                        {expandedCourse === c.id && (
                          <div style={{padding:"12px 16px",borderTop:"1px solid #e0e0e0"}}>
                            <p style={{fontSize:"0.8rem",fontWeight:600,color:"#2c3e50",marginBottom:6}}>Enrolled Mentees:</p>
                              {(() => {
                                const fromArray = c.enrolledMentees || [];
                                const fromEnrollments = enrollmentMap.filter(e => e.courseTitle === c.title).map(e => e.userId);
                                const allIds = [...new Set([...fromArray, ...fromEnrollments])];
                                const mentees = resolveMentees(allIds);
                                return mentees.length === 0 ? (
                                  <p style={{fontSize:"0.78rem",color:"#999"}}>No mentees enrolled yet.</p>
                                ) : (
                                  <div style={{overflowX:"auto",maxWidth:"100%"}}><Table><thead><tr><Th>Name</Th><Th>Email</Th></tr></thead>
                                  <tbody>{mentees.map((m, i) => (
                                    <tr key={i}><Td>{m.name}</Td><Td>{m.email}</Td></tr>
                                  ))}</tbody></Table></div>
                                );
                              })()}
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
