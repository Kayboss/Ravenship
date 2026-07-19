import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { addNotification } from "../../firebase/db";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import { Card, CardTitle, Input, Textarea, Select, Btn } from "./adminStyles";

export default function AdminNotifications() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [notifMsg, setNotifMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")))
      .then(snap => setList(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => console.error("getNotifications error:", e))
      .finally(() => setLoading(false));
  }, []);
  const send = () => {
    if (!title.trim() || !message.trim()) { setNotifMsg("Title and message are required"); return; }
    setSending(true);
    setNotifMsg("");
    addNotification({ title, message, targetRole })
      .then(id => { setList(prev => [{ id, title, message, targetRole, createdAt: new Date().toISOString() }, ...prev]); setTitle(""); setMessage(""); setNotifMsg("Sent!"); setTimeout(() => setNotifMsg(""), 2000); })
      .catch(e => setNotifMsg(e.message))
      .finally(() => setSending(false));
  };
  const remove = (id) => {
    setDeleting(id);
    deleteDoc(doc(db, "notifications", id))
      .then(() => { setList(prev => prev.filter(n => n.id !== id)); })
      .catch(e => setNotifMsg(e.message))
      .finally(() => setDeleting(null));
  };
  if (loading) return <Card data-aos="fade-up"><LoadingSpinner label="Loading..." fullHeight /></Card>;
  return (
    <Card data-aos="fade-up">
      <CardTitle>🔔 Send Notifications</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <Input id="notifications-title" name="notificationTitle" placeholder="Notification title..." value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea id="notifications-message" name="notificationMessage" placeholder="Message content..." value={message} onChange={e => setMessage(e.target.value)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Select id="notifications-targetRole" name="targetRole" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
            <option value="all">All Users</option><option value="mentor">Mentors Only</option><option value="mentee">Mentees Only</option>
          </Select>
          <Btn disabled={sending} onClick={send}>{sending ? "Sending..." : "Send Notification"}</Btn>
        </div>
        {notifMsg && <p style={{ fontSize: "0.85rem", color: ["Sent!", "Deleted"].includes(notifMsg) ? "#2e7d32" : "#e53935", fontWeight: 600 }}>{notifMsg}</p>}
      </div>
      <CardTitle style={{ fontSize: "0.95rem" }}>Sent Notifications ({list.length})</CardTitle>
      {list.length === 0 ? <p style={{ color: "#594048", fontSize: "0.85rem" }}>No notifications sent yet.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map(n => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f9f9f9", borderRadius: 12 }}>
              <div><strong style={{ fontSize: "0.9rem", display: "block", marginBottom: 2 }}>{n.title}</strong>
                <span style={{ fontSize: "0.8rem", color: "#594048" }}>{n.message}</span>
                <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: 12 }}>→ {n.targetRole}</span></div>
              <Btn $red disabled={deleting === n.id} onClick={() => remove(n.id)}>{deleting === n.id ? "✕" : "✕"}</Btn>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
