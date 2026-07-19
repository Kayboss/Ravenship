import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getHelpGuides, addHelpGuide, getCounsellingRequests, deleteCounsellingRequest, getSponsorshipRequests, deleteSponsorshipRequest } from "../../firebase/db";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import { Card, CardTitle, SubTab, Badge, Btn, Input, Textarea, Select, ViewBtn, PdfOverlay, PdfModalInner, PdfCloseBtn } from "./adminStyles";

export default function AdminHelpCenter() {
  const [loading, setLoading] = useState(true);
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
  useEffect(() => {
    Promise.allSettled([
      getDocs(collection(db, "helpMessages")).then(snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      getHelpGuides().then(d => setGuides(Array.isArray(d) ? d : [])),
      getCounsellingRequests().then(d => setCounselReqs(Array.isArray(d) ? d : [])),
      getSponsorshipRequests().then(d => setSponsorReqs(Array.isArray(d) ? d : []))
    ]).finally(() => setLoading(false));
  }, []);

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
  if (loading) return <Card data-aos="fade-up"><LoadingSpinner label="Loading..." fullHeight /></Card>;
  return (
    <Card data-aos="fade-up">
      <style>{`
        .hc-msg-header{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}
        .hc-msg-footer{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .hc-msg-type{font-weight:700;font-size:0.85rem;color:#2c3e50;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
        .hc-guide-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f9f9f9;border-radius:12px;gap:12px}
        .hc-guide-info{flex:1;min-width:0}
        .hc-req-row{padding:14px 16px;background:#f9f9f9;border-radius:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
        .hc-req-info{flex:1;min-width:0}
        .hc-req-info p{margin:2px 0;font-size:0.85rem;color:#594048;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .hc-req-info p:first-child{margin-top:0}
        .hc-req-actions{display:flex;gap:8px;flex-shrink:0;align-items:center}
        @media(max-width:480px){
          .hc-msg-header{flex-wrap:wrap}
          .hc-msg-footer{flex-wrap:wrap;gap:6px}
          .hc-guide-row{flex-wrap:wrap}
          .hc-req-row{flex-wrap:wrap}
          .hc-req-info p{white-space:normal}
        }
      `}</style>
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
                  <div className="hc-msg-header">
                    <span className="hc-msg-type">{m.type}{m.userName ? ` — ${m.userName}` : ""}</span>
                    <Badge $c={m.status === "open" ? "#f57f17" : "#2e7d32"}>{m.status === "open" ? "Open" : "Resolved"}</Badge>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 4 }}>{m.message}</p>
                  <div className="hc-msg-footer">
                    <span style={{ fontSize: "0.72rem", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{m.userEmail} · {new Date(m.createdAt?.toDate ? m.createdAt.toDate() : m.createdAt).toLocaleDateString()}</span>
                    <Btn $outline disabled={toggling === m.id} style={{ fontSize: "0.75rem", padding: "6px 12px", minHeight: 34, flexShrink: 0 }} onClick={() => toggleStatus(m.id)}>
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
            <Input id="helpCenter-guideTitle" name="guideTitle" placeholder="Guide title..." value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea id="helpCenter-guideContent" name="guideContent" placeholder="Guide content (markdown or plain text)..." value={content} onChange={e => setContent(e.target.value)} />
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Select id="helpCenter-targetRole" name="targetRole" value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{flex:"1 1 120px"}}>
                <option value="all">All Users</option><option value="mentor">Mentors</option><option value="mentee">Mentees</option>
              </Select>
              <Btn disabled={addingGuide} onClick={addGuide} style={{minHeight:38}}>{addingGuide ? "Saving..." : "Add Guide"}</Btn>
            </div>
            {guideMsg && <p style={{ fontSize: "0.85rem", color: guideMsg === "Guide created!" ? "#2e7d32" : "#e53935", fontWeight: 600 }}>{guideMsg}</p>}
          </div>
          {guides.length === 0 ? <p style={{ color: "#594048" }}>No guides created yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {guides.map(g => (
                <div key={g.id} className="hc-guide-row">
                  <div className="hc-guide-info">
                    <strong style={{ fontSize: "0.9rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#594048", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.content.slice(0, 100)}{g.content.length > 100 ? "..." : ""}</span>
                    <span style={{ fontSize: "0.75rem", color: "#999" }}>→ {g.targetRole}</span>
                  </div>
                  <Btn $red disabled={removingGuide === g.id} onClick={() => removeGuide(g.id)} style={{minHeight:34,flexShrink:0}}>{removingGuide === g.id ? "..." : "✕"}</Btn>
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
              <div key={req.id} className="hc-req-row">
                <div className="hc-req-info">
                  <p><strong>{req.name}</strong> &lt;{req.email}&gt;</p>
                  <p>Type: {req.type}</p>
                  {req.reasons && <p>Reasons: {req.reasons}</p>}
                  <p>Preferred date: {req.dateTime}</p>
                  <span style={{fontSize:"0.75rem",color:"#999"}}>Submitted {fmtDate(req.createdAt)}</span>
                </div>
                <Btn $red style={{fontSize:"0.75rem",padding:"6px 12px",minHeight:34}} onClick={() => handleDeleteCounsel(req.id)}>Delete</Btn>
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
              <div key={req.id} className="hc-req-row">
                <div className="hc-req-info">
                  <p><strong>{req.userName || req.name}</strong> &lt;{req.userEmail || req.email}&gt;</p>
                  <p>Type: {req.type} | Amount: {req.amount}</p>
                  <p>Purpose: {req.purpose}</p>
                  <span style={{fontSize:"0.75rem",color:"#999"}}>Submitted {fmtDate(req.createdAt)}</span>
                </div>
                <div className="hc-req-actions">
                  <ViewBtn onClick={() => setPdfModal(req)} style={{minHeight:34}}>View PDF</ViewBtn>
                  <Btn $red style={{fontSize:"0.75rem",padding:"6px 12px",minHeight:34}} onClick={() => handleDeleteSponsor(req.id)}>Delete</Btn>
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
            {pdfModal.pdfData?.startsWith("data:application/pdf") ? (
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
