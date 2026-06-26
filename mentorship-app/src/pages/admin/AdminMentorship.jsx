import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getMentors, getUnassignedMentees, getMenteesByMentor, assignMenteeToMentor, removeMenteeFromMentor, getUserByEmail, getAdmins, updateUser } from "../../firebase/db";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardTitle, Select, Input, Btn } from "./adminStyles";

export default function AdminMentorship() {
  const [mentors, setMentors] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [assignedMentees, setAssignedMentees] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [demotingId, setDemotingId] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  const load = () => {
    getMentors().then(d => setMentors(Array.isArray(d) ? d : [])).catch(e => console.error("getMentors error:", e));
    getUnassignedMentees().then(d => setUnassigned(Array.isArray(d) ? d : [])).catch(e => console.error("getUnassignedMentees error:", e));
  };
  const loadAdmins = () => {
    getAdmins().then(d => setAdmins(Array.isArray(d) ? d : [])).catch(e => console.error("getAdmins error:", e));
  };
  useEffect(() => { load(); loadAdmins(); }, []);

  const handleAddAdmin = async () => {
    const email = adminEmail.trim().toLowerCase();
    if (!email) { setAdminMsg("Enter an email address"); return; }
    setAdminLoading(true);
    setAdminMsg("");
    try {
      const user = await getUserByEmail(email);
      if (!user) { setAdminMsg("No user found with that email"); setAdminLoading(false); return; }
      if (user.role === "admin") { setAdminMsg(`${email} is already an admin`); setAdminLoading(false); return; }
      await updateUser(user.id, { role: "admin", verified: true });
      setAdminMsg(`Promoted ${user.name || email} to Admin`);
      setAdminEmail("");
      loadAdmins();
    } catch (e) { setAdminMsg(e.message); }
    setAdminLoading(false);
  };

  const handleDemote = async (id, name) => {
    if (!window.confirm(`Demote ${name} from Admin to Mentee?`)) return;
    setDemotingId(id);
    try {
      await updateUser(id, { role: "mentee" });
      loadAdmins();
    } catch (e) { console.error("demote error:", e); }
    setDemotingId(null);
  };

  useEffect(() => {
    if (selectedMentor) {
      setGroupName(selectedMentor.groupName || "");
      getMenteesByMentor(selectedMentor.id).then(d => setAssignedMentees(Array.isArray(d) ? d : [])).catch(e => console.error("getMenteesByMentor error:", e));
    } else {
      setAssignedMentees([]);
      setGroupName("");
    }
  }, [selectedMentor]);

  const saveGroupName = async () => {
    if (!selectedMentor) return;
    setLoading(true);
    setMsg("");
    try {
      await updateDoc(doc(db, "users", selectedMentor.id), { groupName });
      setMsg("Group name saved!");
      setMentors(prev => prev.map(m => m.id === selectedMentor.id ? { ...m, groupName } : m));
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  const doAssign = async (menteeId, menteeName) => {
    if (!selectedMentor) { setMsg("Select a mentor first"); return; }
    setLoading(true);
    setMsg("");
    try {
      await assignMenteeToMentor(selectedMentor.id, menteeId);
      setMsg(`Assigned ${menteeName} to ${selectedMentor.name}`);
      setUnassigned(prev => prev.filter(u => u.id !== menteeId));
      setAssignedMentees(prev => [...prev, { id: menteeId, name: menteeName }]);
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  const doUnassign = async (menteeId, menteeName) => {
    if (!selectedMentor) return;
    setLoading(true);
    setMsg("");
    try {
      await removeMenteeFromMentor(selectedMentor.id, menteeId);
      setMsg(`Removed ${menteeName} from ${selectedMentor.name}`);
      setAssignedMentees(prev => prev.filter(u => u.id !== menteeId));
      getUnassignedMentees().then(d => setUnassigned(Array.isArray(d) ? d : [])).catch(e => console.error("getUnassignedMentees refresh error:", e));
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <><Card data-aos="fade-up">
      <style>{`
        .ms-panels{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .ms-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f9f9f9;border-radius:10px}
        .ms-row-name{flex:1;min-width:0;font-weight:600;font-size:0.85rem;color:#2c3e50;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ms-group-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .ms-select-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
        .ms-select-row select{flex:1 1 250px;min-width:0}
        .ms-select-row button{flex-shrink:0}
        .ms-list{display:flex;flex-direction:column;gap:8px}
        @media(max-width:600px){
          .ms-panels{grid-template-columns:1fr !important}
          .ms-row{flex-wrap:wrap;gap:8px}
          .ms-group-row{flex-direction:column;align-items:stretch}
          .ms-group-row > label{text-align:left}
          .ms-group-row > input{width:100% !important;max-width:100% !important}
          .ms-group-row > button{width:100%;min-height:40px}
          .ms-select-row{flex-direction:column}
          .ms-select-row select{width:100%;flex:1 1 auto}
          .ms-select-row button{width:100%;min-height:40px}
        }
      `}</style>
      <CardTitle>🔗 Mentor–Mentee Assignments</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Select a mentor to manage their group and assigned mentees.</p>
      {msg && <p style={{fontSize:"0.85rem",color:msg.includes("rror")||msg.includes("first")?"#e53935":"#2e7d32",fontWeight:600,marginBottom:12}}>{msg}</p>}

      <div className="ms-select-row">
        <Select id="mentorship-mentor" name="mentor" value={selectedMentor?.id || ""} onChange={e => {
          const m = mentors.find(mm => mm.id === e.target.value);
          setSelectedMentor(m || null);
        }}>
          <option value="">— Select a mentor —</option>
          {mentors.map(m => <option key={m.id} value={m.id}>{m.name}{m.groupName ? ` (${m.groupName})` : ""} ({m.email})</option>)}
        </Select>
        <Btn $outline onClick={() => { setSelectedMentor(null); load(); }}>Refresh</Btn>
      </div>

      {selectedMentor && (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div className="ms-group-row">
            <label style={{fontWeight:600,fontSize:"0.85rem",color:"#2c3e50"}}>Group Name:</label>
            <Input id="mentorship-groupName" name="groupName" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Cohort Alpha, Group A..." style={{flex:"1 1 200px",maxWidth:300,minWidth:0}} />
            <Btn disabled={loading} onClick={saveGroupName}>{loading ? "Saving..." : "Save"}</Btn>
          </div>
          <div className="ms-panels">
            <div>
              <h5 style={{fontSize:"0.9rem",fontWeight:700,color:"#2c3e50",marginBottom:12}}>👤 Assigned to {selectedMentor.name}</h5>
              {assignedMentees.length === 0 ? (
                <p style={{fontSize:"0.85rem",color:"#999"}}>No mentees assigned yet.</p>
              ) : (
                <div className="ms-list">
                  {assignedMentees.map(m => (
                    <div key={m.id} className="ms-row">
                      {m.photoURL ? (
                        <img src={m.photoURL} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                      ) : (
                        <div style={{width:32,height:32,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                          {(m.name || "?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                        </div>
                      )}
                      <span className="ms-row-name">{m.name}</span>
                      <Btn $red disabled={loading} onClick={() => doUnassign(m.id, m.name)} style={{fontSize:"0.75rem",padding:"6px 12px",minHeight:34,flexShrink:0}}>Unassign</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h5 style={{fontSize:"0.9rem",fontWeight:700,color:"#2c3e50",marginBottom:12}}>📋 Unassigned Mentees</h5>
              {unassigned.length === 0 ? (
                <p style={{fontSize:"0.85rem",color:"#999"}}>All mentees are assigned.</p>
              ) : (
                <div className="ms-list">
                  {unassigned.map(m => (
                    <div key={m.id} className="ms-row">
                      {m.photoURL ? (
                        <img src={m.photoURL} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                      ) : (
                        <div style={{width:32,height:32,borderRadius:"50%",background:"#0298D7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                          {(m.name || "?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                        </div>
                      )}
                      <span className="ms-row-name">{m.name}</span>
                      <Btn disabled={loading || !selectedMentor} onClick={() => doAssign(m.id, m.name)} style={{fontSize:"0.75rem",padding:"6px 12px",minHeight:34,flexShrink:0}}>Assign</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>

    {/* ── Admin Management ── */}
    <Card data-aos="fade-up" data-aos-delay="100">
      <CardTitle>🛡️ Admin Management</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Promote an existing user to Admin, or demote an existing Admin.</p>
      {adminMsg && <p style={{fontSize:"0.85rem",color:adminMsg.includes("error")||adminMsg.includes("No user found")||adminMsg.includes("already")?"#e53935":"#2e7d32",fontWeight:600,marginBottom:12}}>{adminMsg}</p>}

      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <Input id="admin-email" name="adminEmail" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Enter user email address" style={{flex:"1 1 280px",minWidth:0}} />
        <Btn disabled={adminLoading} onClick={handleAddAdmin} style={{flexShrink:0}}>{adminLoading ? "Promoting..." : "Add Admin"}</Btn>
      </div>

      <h5 style={{fontSize:"0.9rem",fontWeight:700,color:"#2c3e50",marginBottom:12}}>Current Admins ({admins.filter(a => a.email !== "tripelkay@gmail.com").length})</h5>
      {admins.length === 0 ? (
        <p style={{fontSize:"0.85rem",color:"#999"}}>No admins found.</p>
      ) : (
        <div className="ms-list">
          {admins.filter(a => a.email !== "tripelkay@gmail.com").map(a => (
            <div key={a.id} className="ms-row">
              {a.photoURL ? (
                <img src={a.photoURL} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
              ) : (
                <div style={{width:32,height:32,borderRadius:"50%",background:"#856404",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                  {(a.name || "?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                </div>
              )}
              <div style={{flex:1,minWidth:0}}>
                <span className="ms-row-name">{a.name}</span>
                <span style={{fontSize:"0.72rem",color:"#594048",display:"block"}}>{a.email}</span>
              </div>
              <Btn $red disabled={demotingId === a.id} onClick={() => handleDemote(a.id, a.name)} style={{fontSize:"0.75rem",padding:"6px 12px",minHeight:34,flexShrink:0}}>
                {demotingId === a.id ? "Demoting..." : "Demote"}
              </Btn>
            </div>
          ))}
        </div>
      )}
    </Card></>
  );
}
