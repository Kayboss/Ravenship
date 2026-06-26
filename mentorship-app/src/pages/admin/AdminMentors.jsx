import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getUsers, verifyUser, unverifyUser, getCourses, logActivity, updateUser, deleteUser } from "../../firebase/db";
import { sendApprovedEmail } from "../../lib/email";
import { Card, Badge, Btn, Table, Th, Td, BioModal } from "./adminStyles";

export default function AdminMentors() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentor, setExpandedMentor] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getUsers().then(d => { const arr = Array.isArray(d) ? d : []; setAllUsers(arr); setUsers(arr.filter(u => u.role === "mentor" && !u.deleted)); }).catch(e => console.error("getUsers error:", e));
    getCourses().then(d => setCourses(Array.isArray(d) ? d : [])).catch(e => console.error("getCourses error:", e));
  }, []);
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
      @media(max-width:560px){.mentor-grid{grid-template-columns:1fr !important}}
      .mentor-header{display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer;overflow:hidden}
      .mentor-info{display:flex;gap:16px;align-items:center;flex:1;min-width:0;overflow:hidden}
      .mentor-meta{display:flex;gap:8px;align-items:center;flex-shrink:0}
      .mentor-card{overflow:hidden;max-width:100%}
      .mentor-card h4,.mentor-card span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
      .course-detail{overflow:hidden;max-width:100%}
      .course-detail span{white-space:normal;word-break:break-word}
      @media(max-width:480px){
        .mentor-header{flex-direction:column;gap:10px}
        .mentor-meta{align-self:flex-start}
      }
    `}</style>
    <div className="mentor-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {verifyMsg && <p style={{gridColumn:"1/-1",fontSize:"0.85rem",color:"#e53935",fontWeight:600,margin:0}}>{verifyMsg}</p>}
      {users.length === 0 ? <p style={{ color: "#594048", fontSize: "0.9rem", gridColumn:"1/-1" }}>No mentors registered.</p> : users.map((u, idx) => {
        const mentorCourses = courses.filter(c => c.instructor?.toLowerCase() === u.name?.toLowerCase());
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
                  <span style={{fontSize:"0.8rem",color:"#594048",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{u.email}{u.phone ? ` · ${u.phone}` : ""}{u.city ? ` · ${u.city}` : ""}</span>
                </div>
              </div>
              <div className="mentor-meta">
                <Badge $c={u.verified ? "#2e7d32" : "#f57f17"}>{u.verified ? "✅ Verified" : "⏳ Pending"}</Badge>
                <span style={{fontSize:"0.75rem",color:"#999"}}>{mentorCourses.length} course{mentorCourses.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {expandedMentor === u.id && (
              <div style={{marginTop:16,borderTop:"1px solid #e0e0e0",paddingTop:16}}>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  <Btn $outline onClick={() => setBioUser(u)}>View Bio</Btn>
                  {u.verified ? <Btn $outline disabled={verifying === u.id} onClick={() => doVerify(u.id, false)}>{verifying === u.id ? "Revoking..." : "Revoke"}</Btn> : <Btn disabled={verifying === u.id} onClick={() => doVerify(u.id, true)}>{verifying === u.id ? "Verifying..." : "✓ Verify"}</Btn>}
                  <Btn $outline style={{color:"#e53935",borderColor:"#e53935"}} onClick={() => doChangeRole(u.id, "mentee")}>Make Mentee</Btn>
                  <Btn $red disabled={verifying === u.id} onClick={() => doDelete(u.id)}>Delete</Btn>
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
                            <span style={{fontWeight:700,fontSize:"1rem",color:"#b50064"}}>{(c.enrolledMentees || c.enrolled || []).length}</span>
                            <span style={{fontSize:"0.72rem",color:"#594048",display:"block"}}>mentees</span>
                          </div>
                        </div>
                        {expandedCourse === c.id && (
                          <div style={{padding:"12px 16px",borderTop:"1px solid #e0e0e0"}}>
                            <p style={{fontSize:"0.8rem",fontWeight:600,color:"#2c3e50",marginBottom:6}}>Enrolled Mentees:</p>
                              {(!c.enrolledMentees || c.enrolledMentees.length === 0) ? (
                              <p style={{fontSize:"0.78rem",color:"#999"}}>No mentees enrolled yet.</p>
                            ) : (
                              <div style={{overflowX:"auto",maxWidth:"100%"}}><Table><thead><tr><Th>Name</Th><Th>Email</Th></tr></thead>
                              <tbody>{resolveMentees(c.enrolledMentees || []).map((m, i) => (
                                <tr key={i}><Td>{m.name}</Td><Td>{m.email}</Td></tr>
                              ))}</tbody></Table></div>
                            )}
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
