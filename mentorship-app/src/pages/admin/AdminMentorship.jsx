import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getMentors, getUnassignedMentees, getMenteesByMentor, assignMenteeToMentor, removeMenteeFromMentor } from "../../firebase/db";
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
  useEffect(() => { AOS.init({ once: true }); }, []);
  const load = () => {
    getMentors().then(d => setMentors(Array.isArray(d) ? d : [])).catch(() => {});
    getUnassignedMentees().then(d => setUnassigned(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selectedMentor) {
      setGroupName(selectedMentor.groupName || "");
      getMenteesByMentor(selectedMentor.id).then(d => setAssignedMentees(Array.isArray(d) ? d : [])).catch(() => {});
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
      getUnassignedMentees().then(d => setUnassigned(Array.isArray(d) ? d : [])).catch(() => {});
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <Card data-aos="fade-up">
      <style>{`
        .ms-panels{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .ms-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f9f9f9;border-radius:10}
        .ms-row-name{flex:1;min-width:0;font-weight:600;font-size:0.85rem;color:#2c3e50;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        @media(max-width:600px){
          .ms-panels{grid-template-columns:1fr !important}
          .ms-row{flex-wrap:wrap;gap:8px}
        }
      `}</style>
      <CardTitle>🔗 Mentor–Mentee Assignments</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Select a mentor to manage their group and assigned mentees.</p>
      {msg && <p style={{fontSize:"0.85rem",color:msg.includes("rror")||msg.includes("first")?"#e53935":"#2e7d32",fontWeight:600,marginBottom:12}}>{msg}</p>}

      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <Select value={selectedMentor?.id || ""} onChange={e => {
          const m = mentors.find(mm => mm.id === e.target.value);
          setSelectedMentor(m || null);
        }} style={{flex:"1 1 250px",minWidth:0}}>
          <option value="">— Select a mentor —</option>
          {mentors.map(m => <option key={m.id} value={m.id}>{m.name}{m.groupName ? ` (${m.groupName})` : ""} ({m.email})</option>)}
        </Select>
        <Btn $outline onClick={() => { setSelectedMentor(null); load(); }}>Refresh</Btn>
      </div>

      {selectedMentor && (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <label style={{fontWeight:600,fontSize:"0.85rem",color:"#2c3e50"}}>Group Name:</label>
            <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Cohort Alpha, Group A..." style={{flex:"1 1 200px",maxWidth:300,minWidth:0}} />
            <Btn disabled={loading} onClick={saveGroupName}>{loading ? "Saving..." : "Save"}</Btn>
          </div>
          <div className="ms-panels">
            <div>
              <h5 style={{fontSize:"0.9rem",fontWeight:700,color:"#2c3e50",marginBottom:12}}>👤 Assigned to {selectedMentor.name}</h5>
              {assignedMentees.length === 0 ? (
                <p style={{fontSize:"0.85rem",color:"#999"}}>No mentees assigned yet.</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {assignedMentees.map(m => (
                    <div key={m.id} className="ms-row">
                      <div style={{width:32,height:32,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                        {(m.name || "?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                      </div>
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
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {unassigned.map(m => (
                    <div key={m.id} className="ms-row">
                      <div style={{width:32,height:32,borderRadius:"50%",background:"#0298D7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                        {(m.name || "?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                      </div>
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
  );
}
