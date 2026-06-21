import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getHelpGuides, addHelpGuide, getCounsellingRequests, deleteCounsellingRequest, getSponsorshipRequests, deleteSponsorshipRequest } from "../../firebase/db";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardTitle, SubTab, Badge, Btn, Input, Textarea, Select, ViewBtn, PdfOverlay, PdfModalInner, PdfCloseBtn } from "./adminStyles";

export default function AdminHelpCenter() {
  const [msgs, setMsgs] = useState([]);
  const [guides, setGuides] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [guideMsg, setGuideMsg] = useState("");
  const [addingGuide, setAddingGuide] = useState(false);
  const [removingGuide, setRemovingGuide] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [helpError, setHelpError] = useState(null);
  const [counselReqs, setCounselReqs] = useState([]);
  const [sponsorReqs, setSponsorReqs] = useState([]);
  const [pdfModal, setPdfModal] = useState(null);
  const [activeTab, setActiveTab] = useState("messages");
  useEffect(() => { AOS.init({ once: true }); }, []);
  const load = () => {
    getDocs(collection(db, "helpMessages"))
      .then(snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
    getHelpGuides().then(d => setGuides(Array.isArray(d) ? d : [])).catch(() => {});
    getCounsellingRequests().then(d => setCounselReqs(Array.isArray(d) ? d : [])).catch(() => {});
    getSponsorshipRequests().then(d => setSponsorReqs(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const fmtDate = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const handleDeleteCounsel = async (id) => {
    await deleteCounsellingRequest(id);
    setCounselReqs(prev => prev.filter(r => r.id !== id));
  };
  const handleDeleteSponsor = async (id) => {
    await deleteSponsorshipRequest(id);
    setSponsorReqs(prev => prev.filter(r => r.id !== id));
  };

  const addGuide = () => {
    if (!title.trim() || !content.trim()) { setGuideMsg("Title and content required"); return; }
    setAddingGuide(true);
    setGuideMsg("");
    setHelpError(null);
    addHelpGuide({ title, content, targetRole })
      .then(id => { setGuides(prev => [{ id, title, content, targetRole }, ...prev]); setTitle(""); setContent(""); setGuideMsg("Guide created!"); setTimeout(() => setGuideMsg(""), 2000); })
      .catch(e => { setHelpError(e.message); setGuideMsg(""); })
      .finally(() => setAddingGuide(false));
  };
  const removeGuide = (id) => {
    setRemovingGuide(id);
    deleteDoc(doc(db, "helpGuides", id))
      .then(() => { setGuides(prev => prev.filter(g => g.id !== id)); })
      .catch(e => setHelpError(e.message))
      .finally(() => setRemovingGuide(null));
  };
  const toggleStatus = (id) => {
    setToggling(id);
    const msg = msgs.find(m => m.id === id);
    const newStatus = msg?.status === "open" ? "resolved" : "open";
    updateDoc(doc(db, "helpMessages", id), { status: newStatus })
      .then(() => { setMsgs(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m)); })
      .catch(e => setHelpError(e.message))
      .finally(() => setToggling(null));
  };

  return (
    <Card data-aos="fade-up">
      <CardTitle>❓ Help Center Management</CardTitle>
      {helpError && <p style={{ fontSize: "0.85rem", color: "#e53935", fontWeight: 600, marginBottom: 12 }}>{helpError}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        <SubTab $active={activeTab === "messages"} onClick={() => setActiveTab("messages")}>📩 Messages & Bug Reports</SubTab>
        <SubTab $active={activeTab === "guides"} onClick={() => setActiveTab("guides")}>📖 Startup Guides</SubTab>
      </div>

      {activeTab === "messages" && (
        <div>
          <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 12 }}>All live chat messages, bug reports, and assistance requests from users.</p>
          {msgs.length === 0 ? <p style={{ color: "#594048" }}>No messages yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {msgs.map(m => (
                <div key={m.id} style={{ padding: "14px 16px", background: "#f9f9f9", borderRadius: 12, borderLeft: `4px solid ${m.status === "open" ? "#f57f17" : "#2e7d32"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.85rem", color: "#2c3e50" }}>{m.type} {m.userName ? `— ${m.userName}` : ""}</strong>
                    <Badge $c={m.status === "open" ? "#f57f17" : "#2e7d32"}>{m.status === "open" ? "Open" : "Resolved"}</Badge>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 4 }}>{m.message}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#999" }}>{m.userEmail} · {new Date(m.createdAt?.toDate ? m.createdAt.toDate() : m.createdAt).toLocaleDateString()}</span>
                    <Btn $outline disabled={toggling === m.id} style={{ fontSize: "0.75rem", padding: "4px 12px" }} onClick={() => toggleStatus(m.id)}>
                      {toggling === m.id ? "..." : m.status === "open" ? "✓ Resolve" : "Reopen"}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "guides" && (
        <div>
          <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 12 }}>Create startup guides for mentors and mentees.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, background: "#f9f9f9", padding: 16, borderRadius: 12 }}>
            <Input placeholder="Guide title..." value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Guide content (markdown or plain text)..." value={content} onChange={e => setContent(e.target.value)} />
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                <option value="all">All Users</option><option value="mentor">Mentors</option><option value="mentee">Mentees</option>
              </Select>
              <Btn disabled={addingGuide} onClick={addGuide}>{addingGuide ? "Saving..." : "Add Guide"}</Btn>
            </div>
            {guideMsg && <p style={{ fontSize: "0.85rem", color: guideMsg === "Guide created!" ? "#2e7d32" : "#e53935", fontWeight: 600 }}>{guideMsg}</p>}
          </div>
          {guides.length === 0 ? <p style={{ color: "#594048" }}>No guides created yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {guides.map(g => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f9f9f9", borderRadius: 12 }}>
                  <div><strong style={{ fontSize: "0.9rem", display: "block" }}>{g.title}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#594048" }}>{g.content.slice(0, 100)}{g.content.length > 100 ? "..." : ""}</span>
                    <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: 8 }}>→ {g.targetRole}</span></div>
                  <Btn $red disabled={removingGuide === g.id} onClick={() => removeGuide(g.id)}>{removingGuide === g.id ? "..." : "✕"}</Btn>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{marginTop:32}}>
        <h4 style={{fontWeight:700,fontSize:"1rem",color:"#2c3e50",marginBottom:16}}>📋 Incoming Counselling Requests</h4>
        {counselReqs.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No counselling requests yet.</p> : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {counselReqs.map(req => (
              <div key={req.id} style={{padding:"14px 16px",background:"#f9f9f9",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:"0.85rem",color:"#2c3e50"}}><strong>{req.name}</strong> &lt;{req.email}&gt;</p>
                  <p style={{margin:"2px 0",fontSize:"0.85rem",color:"#594048"}}>Type: {req.type}</p>
                  {req.reasons && <p style={{margin:"2px 0",fontSize:"0.85rem",color:"#594048"}}>Reasons: {req.reasons}</p>}
                  <p style={{margin:"2px 0",fontSize:"0.85rem",color:"#594048"}}>Preferred date: {req.dateTime}</p>
                  <span style={{fontSize:"0.75rem",color:"#999"}}>Submitted {fmtDate(req.createdAt)}</span>
                </div>
                <Btn $red style={{fontSize:"0.75rem",padding:"4px 12px"}} onClick={() => handleDeleteCounsel(req.id)}>Delete</Btn>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{marginTop:32}}>
        <h4 style={{fontWeight:700,fontSize:"1rem",color:"#2c3e50",marginBottom:16}}>📋 Incoming Sponsorship Requests</h4>
        {sponsorReqs.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No sponsorship requests yet.</p> : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sponsorReqs.map(req => (
              <div key={req.id} style={{padding:"14px 16px",background:"#f9f9f9",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:"0.85rem",color:"#2c3e50"}}><strong>{req.userName || req.name}</strong> &lt;{req.userEmail || req.email}&gt;</p>
                  <p style={{margin:"2px 0",fontSize:"0.85rem",color:"#594048"}}>Type: {req.type} | Amount: {req.amount}</p>
                  <p style={{margin:"2px 0",fontSize:"0.85rem",color:"#594048"}}>Purpose: {req.purpose}</p>
                  <span style={{fontSize:"0.75rem",color:"#999"}}>Submitted {fmtDate(req.createdAt)}</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <ViewBtn onClick={() => setPdfModal(req)}>View PDF</ViewBtn>
                  <Btn $red style={{fontSize:"0.75rem",padding:"4px 12px"}} onClick={() => handleDeleteSponsor(req.id)}>Delete</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pdfModal && (
        <PdfOverlay onClick={() => setPdfModal(null)}>
          <PdfModalInner onClick={e => e.stopPropagation()}>
            <PdfCloseBtn onClick={() => setPdfModal(null)}>&times;</PdfCloseBtn>
            {pdfModal.pdfData ? (
              <iframe src={pdfModal.pdfData} title="Sponsorship Request PDF" style={{width:"100%",height:"100%",border:"none",borderRadius:12}} />
            ) : (
              <p style={{padding:40,textAlign:"center",color:"#594048"}}>No PDF data available for this request.</p>
            )}
          </PdfModalInner>
        </PdfOverlay>
      )}
    </Card>
  );
}
