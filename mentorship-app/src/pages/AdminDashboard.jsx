import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { AdminSidebar } from "../components/layout/AdminSidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";

const Page = styled.div`display:flex;min-height:100vh;background:${p => p.theme.colors.background};`;
const Main = styled.main`flex:1;margin-left:280px;padding:0 ${p => p.theme.spacing.xl} ${p => p.theme.spacing.xl};@media(max-width:${p => p.theme.breakpoints.mobile}){margin-left:0;padding:${p => p.theme.spacing.sm}}@media(min-width:${p => p.theme.breakpoints.mobile}) and (max-width:${p => p.theme.breakpoints.tablet}){margin-left:0;padding:${p => p.theme.spacing.lg}}`;

const Card = styled.div`background:#fff;border-radius:20px;border:1px solid #e0e0e0;padding:24px;margin-bottom:24px;`;
const CardTitle = styled.h4`font-weight:700;font-size:1.05rem;color:#2c3e50;margin-bottom:16px;`;
const SubTab = styled.button`padding:10px 20px;border-radius:12px;border:none;background:${p => p.$active ? "#b50064" : "#fff"};color:${p => p.$active ? "#fff" : "#594048"};font-family:inherit;font-weight:${p => p.$active ? 700 : 500};font-size:0.85rem;cursor:pointer;transition:all 0.2s;border:1px solid ${p => p.$active ? "#b50064" : "#e0e0e0"};&:hover{opacity:0.9}`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:0.85rem;`;
const Th = styled.th`text-align:left;padding:10px 12px;border-bottom:2px solid #e0e0e0;color:#594048;font-weight:600;`;
const Td = styled.td`padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#2c3e50;`;
const Badge = styled.span`display:inline-block;padding:3px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;background:${p => p.$c}20;color:${p => p.$c};`;
const Btn = styled.button`padding:6px 16px;border-radius:8px;border:none;background:${p => p.$red ? "#e53935" : p.$outline ? "transparent" : "#b50064"};color:${p => p.$outline ? "#b50064" : "#fff"};font-family:inherit;font-weight:600;font-size:0.8rem;cursor:pointer;border:${p => p.$outline ? "1px solid #b50064" : "none"};&:hover{opacity:0.85}&:disabled{opacity:0.5;cursor:not-allowed}`;
const Input = styled.input`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;width:100%;box-sizing:border-box;`;
const Textarea = styled.textarea`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;width:100%;box-sizing:border-box;resize:vertical;min-height:80px;`;
const Select = styled.select`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;background:#fff;`;

const ModalOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;`;
const ModalBox = styled.div`background:#fff;border-radius:20px;padding:32px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);`;
const ModalTitle = styled.h3`font-weight:700;font-size:1.1rem;color:#2c3e50;margin-bottom:20px;`;

const BioModal = ({ user, onClose }) => {
  if (!user) return null;
  const dob = [user.dobMonth, user.dobDay, user.dobYear].filter(Boolean).join(" ");
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:700,color:"#fff"}}>
            {user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
          </div>
          <div><ModalTitle style={{margin:0}}>{user.name}</ModalTitle>
            <span style={{fontSize:"0.85rem",color:"#594048"}}>{user.email} · {user.role}</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {user.phone && <Field label="Phone" value={user.phone} />}
          {user.city && <Field label="City" value={user.city} />}
          {dob && <Field label="Date of Birth" value={dob} />}
          {user.bio && <Field label="Bio" value={user.bio} />}
          {user.interests?.length > 0 && <Field label="Interests" value={user.interests.join(", ")} />}
          {user.skills?.length > 0 && <Field label="Skills" value={user.skills.join(", ")} />}
          {user.verified !== undefined && <Field label="Status" value={user.verified ? "✅ Verified" : "⏳ Pending Verification"} />}
          {!user.phone && !user.city && !dob && !user.bio && !user.interests?.length && !user.skills?.length && (
            <p style={{color:"#999",fontSize:"0.85rem",textAlign:"center"}}>No additional profile information provided.</p>
          )}
        </div>
        <button onClick={onClose} style={{marginTop:20,padding:"10px 24px",borderRadius:10,border:"1px solid #e0e0e0",background:"#fff",color:"#594048",fontFamily:"inherit",fontWeight:600,cursor:"pointer",width:"100%"}}>Close</button>
      </ModalBox>
    </ModalOverlay>
  );
};

const Field = ({ label, value }) => (
  <div><strong style={{fontSize:"0.8rem",color:"#594048",display:"block",marginBottom:2}}>{label}</strong>
    <span style={{fontSize:"0.9rem",color:"#2c3e50"}}>{value}</span></div>
);

const KpiGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px;`;
const KpiCard = styled.div`background:${p => p.theme.colors.surface || "#fff"};border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);border-left:4px solid ${p => p.$border};border:1px solid ${p => p.theme.colors.outline}30;`;
const KpiIcon = styled.div`width:40px;height:40px;border-radius:12px;background:${p => p.$bg}20;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:12px;`;
const KpiValue = styled.div`font-size:1.8rem;font-weight:800;color:${p => p.theme.colors.textPrimary};`;
const KpiLabel = styled.div`font-size:0.78rem;color:${p => p.theme.colors.textSecondary};font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-top:2px;`;
const KpiTrend = styled.span`font-size:0.75rem;font-weight:700;color:${p => p.$positive ? "#27AE60" : p.theme.colors.textSecondary};display:flex;align-items:center;gap:4px;`;

const DashboardGrid = styled.div`display:grid;grid-template-columns:2fr 1fr;gap:24px;@media(max-width:1024px){grid-template-columns:1fr;}`;
const UserTable = styled.table`width:100%;border-collapse:collapse;font-size:0.85rem;`;
const UTh = styled.th`text-align:left;padding:14px 16px;border-bottom:2px solid ${p => p.theme.colors.outline}30;color:${p => p.theme.colors.textSecondary};font-weight:600;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;`;
const UTd = styled.td`padding:14px 16px;border-bottom:1px solid ${p => p.theme.colors.outline}15;color:${p => p.theme.colors.textPrimary};`;
const URow = styled.tr`&:hover{background:${p => p.theme.colors.background};cursor:pointer;transition:all 0.15s;}`;
const RoleBadge = styled.span`display:inline-block;padding:3px 12px;border-radius:50px;font-size:0.72rem;font-weight:700;background:${p => p.$mentor ? "#ffd9e3" : "#c8e6ff"};color:${p => p.$mentor ? "#8d004d" : "#004a6c"};`;
const StatusDot = styled.span`display:inline-block;width:8px;height:8px;border-radius:50%;background:${p => p.$online ? "#27AE60" : "#594048"};margin-right:6px;`;

const ChartCard = styled.div`background:${p => p.theme.colors.surface || "#fff"};border-radius:16px;padding:20px;border:1px solid ${p => p.theme.colors.outline}30;`;
const ChartBar = styled.div`width:100%;background:${p => p.$active ? "#b50064" : "#ffd9e3"};border-radius:6px 6px 0 0;transition:height 1s ease-out;`;
const ChartGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:20px;@media(max-width:${p => p.theme.breakpoints.mobile}){grid-template-columns:1fr;}`;

const SectionTitle = styled.h4`font-size:0.75rem;font-weight:700;color:${p => p.theme.colors.textSecondary};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;`;

const AnnTag = styled.span`display:inline-block;padding:2px 10px;border-radius:50px;font-size:0.7rem;font-weight:700;background:${p => p.$c}20;color:${p => p.$c};`;

function DashboardOverview() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();
  let user = { name: "Admin" };
  try { const s = localStorage.getItem("user"); if (s) user = JSON.parse(s); } catch {}
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/admin/analytics", { headers }).then(r => r.json()).then(d => setData(d)).catch(() => {});
    fetch("/api/admin/users", { headers }).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/notifications", { headers }).then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 18) return "Good afternoon"; return "Good evening"; })();
  const totalUsers = data ? data.total : users.length;
  const mentors = data ? data.mentors : users.filter(u => u.role === "mentor").length;
  const mentees = data ? data.mentees : users.filter(u => u.role === "mentee").length;
  return (
    <>
      <Card data-aos="fade-down">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div style={{flex:1,minWidth:200}}>
            <h2 style={{fontSize:"clamp(1.3rem, 5vw, 1.8rem)",fontWeight:800,color:"#2c3e50",margin:0}}>{greeting}, {user.name.split(" ")[0]}! 👋</h2>
            <p style={{color:"#594048",fontSize:"clamp(0.8rem, 2.5vw, 0.9rem)",margin:"4px 0 0"}}>Here's what's happening with your mentorship program today.</p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:"clamp(1.3rem, 5vw, 2rem)",fontWeight:800,color:"#b50064"}}>{totalUsers}</div>
            <div style={{fontSize:"0.78rem",color:"#594048",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.03em"}}>Total Users</div>
          </div>
        </div>
      </Card>
      <div style={{marginBottom:"clamp(16px, 4vw, 32px)"}} data-aos="fade-down">
        <h2 style={{fontSize:"clamp(1.2rem, 4.5vw, 1.5rem)",fontWeight:700,color:user.name==="Admin"?"#2c3e50":"inherit",marginBottom:4}}>Program Oversight</h2>
        <p style={{color:"#594048",fontSize:"clamp(0.8rem, 2.5vw, 0.9rem)",margin:0}}>Real-time performance metrics and user engagement analytics.</p>
      </div>

      <KpiGrid data-aos="fade-up">
        <KpiCard $border="#b50064">
          <KpiIcon $bg="#b50064">👥</KpiIcon>
          <KpiValue>{totalUsers}</KpiValue>
          <KpiLabel>Total Enrollment</KpiLabel>
          <KpiTrend $positive>📈 +12%</KpiTrend>
        </KpiCard>
        <KpiCard $border="#0298D7">
          <KpiIcon $bg="#0298D7">🧠</KpiIcon>
          <KpiValue>{mentors} vs {mentees}</KpiValue>
          <KpiLabel>Mentors vs Mentees</KpiLabel>
          <KpiTrend>1:8 Ratio</KpiTrend>
        </KpiCard>
        <KpiCard $border="#DC207E">
          <KpiIcon $bg="#DC207E">✅</KpiIcon>
          <KpiValue>78.4%</KpiValue>
          <KpiLabel>Completion Rate</KpiLabel>
          <KpiTrend $positive>📈 +5%</KpiTrend>
        </KpiCard>
        <KpiCard $border="#cca800">
          <KpiIcon $bg="#cca800">⏱️</KpiIcon>
          <KpiValue>4.2 Hrs</KpiValue>
          <KpiLabel>Avg. Weekly Activity</KpiLabel>
        </KpiCard>
      </KpiGrid>

      <DashboardGrid data-aos="fade-up">
        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          <Card style={{padding:0,overflow:"hidden",marginBottom:0}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #e0e0e0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <CardTitle style={{margin:0}}>User Management</CardTitle>
              <div style={{display:"flex",gap:8}}>
                <button style={{padding:"6px 12px",borderRadius:8,border:"1px solid #e0e0e0",background:"#fff",cursor:"pointer",fontSize:"0.78rem"}}>🔽 Filter</button>
                <button style={{padding:"6px 16px",borderRadius:8,border:"none",background:"#b50064",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:"0.78rem"}}>View All</button>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <UserTable>
                <thead><tr><UTh>User</UTh><UTh>Role</UTh><UTh>Progress</UTh><UTh>Status</UTh><UTh></UTh></tr></thead>
                <tbody>
                  {users.slice(0,6).map((u,i) => (
                    <URow key={u.id || i}>
                      <UTd>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:36,height:36,borderRadius:"50%",background:u.role === "mentor" ? "#b50064" : "#0298D7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                            {u.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "?"}
                          </div>
                          <div>
                            <div style={{fontWeight:700,fontSize:"0.85rem"}}>{u.name}</div>
                            <div style={{fontSize:"0.72rem",color:"#594048"}}>{u.email}</div>
                          </div>
                        </div>
                      </UTd>
                      <UTd><RoleBadge $mentor={u.role === "mentor"}>{u.role === "mentor" ? "Mentor" : "Mentee"}</RoleBadge></UTd>
                      <UTd>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:64,height:6,borderRadius:3,background:"#e4e2e1",overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:3,background:u.role === "mentor" ? "#27AE60" : "#DC207E",width:`${Math.min(100, 50 + Math.floor(Math.random() * 50))}%`}} />
                          </div>
                          <span style={{fontSize:"0.72rem",color:"#594048"}}>{Math.floor(50 + Math.random() * 50)}%</span>
                        </div>
                      </UTd>
                      <UTd><span style={{display:"flex",alignItems:"center",fontSize:"0.78rem",fontWeight:600,color:i % 3 === 0 ? "#594048" : "#27AE60"}}><StatusDot $online={i % 3 !== 0} />{i % 3 === 0 ? "Offline" : "Active"}</span></UTd>
                      <UTd><span style={{fontSize:"1.2rem",color:"#594048",cursor:"pointer"}}>⋯</span></UTd>
                    </URow>
                  ))}
                </tbody>
              </UserTable>
            </div>
          </Card>

          <ChartGrid>
            <ChartCard>
              <SectionTitle>Weekly Engagement</SectionTitle>
              <div style={{display:"flex",alignItems:"flex-end",height:160,gap:8}}>
                {[60,40,85,95,70,55,30].map((h,i) => (
                  <ChartBar key={i} $active={i === 3} style={{height:`${h}%`}} />
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:"0.72rem",color:"#594048"}}>
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </ChartCard>
            <ChartCard>
              <SectionTitle>Enrollment Sources</SectionTitle>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {[{l:"Internal Referrals",v:64,c:"#0298D7"},{l:"LinkedIn Outreach",v:22,c:"#DC207E"},{l:"Community Hub",v:14,c:"#cca800"}].map(s => (
                  <div key={s.l}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",marginBottom:6}}><span style={{color:"#2c3e50"}}>{s.l}</span><span style={{fontWeight:700}}>{s.v}%</span></div>
                    <div style={{height:8,borderRadius:4,background:"#e4e2e1",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,background:s.c,width:`${s.v}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </ChartGrid>
        </div>

        <Card style={{display:"flex",flexDirection:"column",marginBottom:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <CardTitle style={{margin:0}}>📢 Announcements</CardTitle>
            <span style={{fontSize:"1.3rem",cursor:"pointer",color:"#b50064"}}>+</span>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>
            {notifs.length === 0 ? (
              <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:24}}>No announcements yet.</p>
            ) : notifs.slice(0,5).map((n,i) => (
              <div key={n.id || i} style={{cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <AnnTag $c={i === 0 ? "#b50064" : i === 1 ? "#006590" : i === 3 ? "#e53935" : "#cca800"}>{i === 0 ? "System Update" : i === 1 ? "Event" : i === 3 ? "Urgent" : "Community"}</AnnTag>
                  <span style={{fontSize:"0.7rem",color:"#999"}}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Today"}</span>
                </div>
                <h5 style={{margin:"0 0 4px",fontWeight:700,fontSize:"0.85rem",color:"#2c3e50"}}>{n.title}</h5>
                <p style={{margin:0,fontSize:"0.78rem",color:"#594048",lineHeight:1.4}}>{n.message}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid #e0e0e0",marginTop:16,paddingTop:16}}>
            <button style={{width:"100%",border:"none",background:"transparent",color:"#b50064",fontWeight:600,cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit"}}>Manage All Feed Items</button>
          </div>
        </Card>
      </DashboardGrid>
    </>
  );
}

function MentorsSection() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentor, setExpandedMentor] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/admin/users", { headers })
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d.filter(u => u.role === "mentor") : [])).catch(() => {});
    fetch("/api/courses", { headers })
      .then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const doVerify = (id, v) => {
    setVerifying(id);
    setVerifyMsg(null);
    fetch("/api/admin/verify-user", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ userId: id, verified: v }) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || "Failed to update"); setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: v } : u)); setVerifyMsg(null); })
      .catch(e => setVerifyMsg(e.message))
      .finally(() => setVerifying(null));
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {verifyMsg && <p style={{gridColumn:"1/-1",fontSize:"0.85rem",color:"#e53935",fontWeight:600,margin:0}}>{verifyMsg}</p>}
      {users.length === 0 ? <p style={{ color: "#594048", fontSize: "0.9rem", gridColumn:"1/-1" }}>No mentors registered.</p> : users.map((u, idx) => {
        const mentorCourses = courses.filter(c => c.instructor.toLowerCase() === u.name.toLowerCase());
        return (
          <Card key={u.id} data-aos="fade-up" style={{marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",cursor:"pointer"}} onClick={() => setExpandedMentor(expandedMentor === u.id ? null : u.id)}>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"#006590",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                  {u.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                </div>
                <div>
                  <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50"}}>{u.name}</h4>
                  <span style={{fontSize:"0.8rem",color:"#594048"}}>{u.email}{u.phone ? ` · ${u.phone}` : ""}{u.city ? ` · ${u.city}` : ""}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                <Badge $c={u.verified ? "#2e7d32" : "#f57f17"}>{u.verified ? "✅ Verified" : "⏳ Pending"}</Badge>
                <span style={{fontSize:"0.75rem",color:"#999"}}>{mentorCourses.length} course{mentorCourses.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {expandedMentor === u.id && (
              <div style={{marginTop:16,borderTop:"1px solid #e0e0e0",paddingTop:16}}>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  <Btn $outline onClick={() => setBioUser(u)}>View Bio</Btn>
                  {u.verified ? <Btn $outline disabled={verifying === u.id} onClick={() => doVerify(u.id, false)}>{verifying === u.id ? "Revoking..." : "Revoke"}</Btn> : <Btn disabled={verifying === u.id} onClick={() => doVerify(u.id, true)}>{verifying === u.id ? "Verifying..." : "✓ Verify"}</Btn>}
                </div>

                <p style={{fontSize:"0.9rem",fontWeight:600,color:"#2c3e50",marginBottom:12}}>📚 Courses ({mentorCourses.length})</p>
                {mentorCourses.length === 0 ? (
                  <p style={{fontSize:"0.8rem",color:"#999"}}>This mentor has no courses yet.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {mentorCourses.map(c => (
                      <div key={c.id} style={{border:"1px solid #e0e0e0",borderRadius:12,overflow:"hidden"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f9f9f9",cursor:"pointer"}}
                          onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                          <div>
                            <strong style={{fontSize:"0.9rem",color:"#2c3e50"}}>{c.title}</strong>
                            <span style={{fontSize:"0.78rem",color:"#594048",marginLeft:8}}>{c.badge} · {c.level} · {c.duration}</span>
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
                              <Table><thead><tr><Th>Name</Th><Th>Email</Th></tr></thead>
                              <tbody>{c.enrolledMentees.map((m, i) => (
                                <tr key={i}><Td>{m.name}</Td><Td>{m.email}</Td></tr>
                              ))}</tbody></Table>
                            )}
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

function MenteesSection() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bioUser, setBioUser] = useState(null);
  const [expandedMentee, setExpandedMentee] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/admin/users", { headers })
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d.filter(u => u.role === "mentee") : [])).catch(() => {});
    fetch("/api/courses", { headers })
      .then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const doVerify = (id, v) => {
    setVerifying(id);
    setVerifyMsg(null);
    fetch("/api/admin/verify-user", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ userId: id, verified: v }) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || "Failed to update"); setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: v } : u)); setVerifyMsg(null); })
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

function GradebookSection() {
  const assignments = ["Design System Audit", "UX Research", "Brand Strategy", "Brand Identity", "Data Strategy"];
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/api/gradebook", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(r => r.json()).then(d => { setMentees(d.mentees || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const total = mentees.length;
  const passing = mentees.filter(m => m.avg >= 60).length;
  const avg = Math.round(mentees.reduce((s, m) => s + m.avg, 0) / (total || 1));
  return (
    <Card data-aos="fade-up">
      <CardTitle>📋 All Submissions & Grades</CardTitle>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[["👥 Total", total, "#594048"], ["📊 Avg Grade", `${avg}%`, "#b50064"], ["✅ Passing", passing, "#2e7d32"], ["❌ Failing", mentees.filter(m => m.avg < 60).length, "#e53935"]].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, minWidth: 100, padding: "12px 16px", background: "#f9f9f9", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#594048", fontWeight: 600 }}>{l}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:480px){.gb-table{display:none}.gb-cards{display:flex}}`}</style>
      <div className="gb-table" style={{ overflowX: "auto" }}>
        <Table><thead><tr><Th>Mentee</Th>{assignments.map(a => <Th key={a}>{a}</Th>)}<Th>Avg</Th><Th>Status</Th></tr></thead>
        <tbody>{mentees.map((m, i) => (
          <tr key={i}>{[<Td key="n"><strong>{m.name}</strong></Td>, ...assignments.map(a => (
            <Td key={a}>{m.scores[a] !== undefined ? <Badge $c={m.scores[a] >= 80 ? "#2e7d32" : m.scores[a] >= 60 ? "#f57f17" : "#e53935"}>{m.scores[a]}</Badge> : <span style={{ color: "#ccc" }}>—</span>}</Td>
          )), <Td key="avg"><Badge $c={m.avg >= 80 ? "#2e7d32" : m.avg >= 60 ? "#f57f17" : "#e53935"}>{m.avg}%</Badge></Td>, <Td key="s"><Badge $c={m.avg >= 60 ? "#2e7d32" : "#e53935"}>{m.avg >= 60 ? "✅ Passing" : "❌ Failing"}</Badge></Td>]}</tr>
        ))}</tbody></Table>
      </div>
      <div className="gb-cards" style={{ display: "none", flexDirection: "column", gap: 12 }}>
        {mentees.map((m, i) => (
          <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <strong style={{ fontSize: "0.9rem" }}>{m.name}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge $c={m.avg >= 80 ? "#2e7d32" : m.avg >= 60 ? "#f57f17" : "#e53935"} style={{ fontSize: "0.78rem" }}>{m.avg}%</Badge>
                <Badge $c={m.avg >= 60 ? "#2e7d32" : "#e53935"} style={{ fontSize: "0.7rem" }}>{m.avg >= 60 ? "✅" : "❌"}</Badge>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {assignments.map(a => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}>
                  <span style={{ color: "#594048" }}>{a}:</span>
                  {m.scores[a] !== undefined ? (
                    <Badge $c={m.scores[a] >= 80 ? "#2e7d32" : m.scores[a] >= 60 ? "#f57f17" : "#e53935"} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>{m.scores[a]}</Badge>
                  ) : <span style={{ color: "#ccc" }}>—</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotificationsSection() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [notifMsg, setNotifMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);
  useEffect(() => {
    fetch("/api/admin/notifications", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const send = () => {
    if (!title.trim() || !message.trim()) { setNotifMsg("Title and message are required"); return; }
    setSending(true);
    setNotifMsg("");
    fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ title, message, targetRole }) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || "Failed to send"); setList(prev => [d, ...prev]); setTitle(""); setMessage(""); setNotifMsg("Sent!"); setTimeout(() => setNotifMsg(""), 2000); })
      .catch(e => setNotifMsg(e.message))
      .finally(() => setSending(false));
  };
  const remove = (id) => {
    setDeleting(id);
    fetch(`/api/admin/notifications/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(async r => { if (!r.ok) throw new Error("Failed to delete"); setList(prev => prev.filter(n => n.id !== id)); })
      .catch(e => setNotifMsg(e.message))
      .finally(() => setDeleting(null));
  };
  return (
    <Card data-aos="fade-up">
      <CardTitle>🔔 Send Notifications</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <Input placeholder="Notification title..." value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Message content..." value={message} onChange={e => setMessage(e.target.value)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
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

function AnalyticsSection() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/admin/analytics", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);
  if (!data) return <Card><p style={{ color: "#594048" }}>Loading...</p></Card>;
  return (
    <>
      <StatGrid data-aos="fade-up">
        <StatCard><StatNum>{data.total}</StatNum><StatLabel>Total Users</StatLabel></StatCard>
        <StatCard><StatNum>{data.mentors}</StatNum><StatLabel>Mentors</StatLabel></StatCard>
        <StatCard><StatNum>{data.mentees}</StatNum><StatLabel>Mentees</StatLabel></StatCard>
        <StatCard><StatNum>{data.admins}</StatNum><StatLabel>Admins</StatLabel></StatCard>
        <StatCard><StatNum>{data.verified}</StatNum><StatLabel>Verified</StatLabel></StatCard>
        <StatCard><StatNum>{data.pending}</StatNum><StatLabel>Pending Verification</StatLabel></StatCard>
      </StatGrid>
      <Card data-aos="fade-up">
        <CardTitle>📊 User Distribution</CardTitle>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[{ label: "Mentors", value: data.mentors, color: "#006590" }, { label: "Mentees", value: data.mentees, color: "#b50064" }, { label: "Admins", value: data.admins, color: "#ffd200" }].map(d => (
            <div key={d.label} style={{ flex: 1, minWidth: 120, textAlign: "center", padding: 20, background: "#f9f9f9", borderRadius: 16 }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: d.color }}>{d.value}</div>
              <div style={{ fontSize: "0.85rem", color: "#594048", marginTop: 4 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function HelpCenterSection() {
  const navigate = useNavigate();
  const loc = useLocation();
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
  const activeTab = loc.hash.includes("?tab=") ? loc.hash.split("?tab=")[1] : "messages";

  const load = () => {
    fetch("/api/admin/help-messages", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(r => r.json()).then(d => setMsgs(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/startup-guides", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(r => r.json()).then(d => setGuides(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addGuide = () => {
    if (!title.trim() || !content.trim()) { setGuideMsg("Title and content required"); return; }
    setAddingGuide(true);
    setGuideMsg("");
    setHelpError(null);
    fetch("/api/admin/startup-guides", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ title, content, targetRole }) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || "Failed to create guide"); setGuides(prev => [d, ...prev]); setTitle(""); setContent(""); setGuideMsg("Guide created!"); setTimeout(() => setGuideMsg(""), 2000); })
      .catch(e => { setHelpError(e.message); setGuideMsg(""); })
      .finally(() => setAddingGuide(false));
  };
  const removeGuide = (id) => {
    setRemovingGuide(id);
    fetch(`/api/admin/startup-guides/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
      .then(async r => { if (!r.ok) throw new Error("Failed to delete guide"); setGuides(prev => prev.filter(g => g.id !== id)); })
      .catch(e => setHelpError(e.message))
      .finally(() => setRemovingGuide(null));
  };
  const toggleStatus = (id) => {
    setToggling(id);
    const msg = msgs.find(m => m.id === id);
    const newStatus = msg?.status === "open" ? "resolved" : "open";
    fetch(`/api/admin/help-messages/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ status: newStatus }) })
      .then(async r => { if (!r.ok) throw new Error("Failed to update status"); setMsgs(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m)); })
      .catch(e => setHelpError(e.message))
      .finally(() => setToggling(null));
  };

  return (
    <Card data-aos="fade-up">
      <CardTitle>❓ Help Center Management</CardTitle>
      {helpError && <p style={{ fontSize: "0.85rem", color: "#e53935", fontWeight: 600, marginBottom: 12 }}>{helpError}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        <SubTab $active={activeTab === "messages"} onClick={() => navigate(`#help?tab=messages`)}>📩 Messages & Bug Reports</SubTab>
        <SubTab $active={activeTab === "guides"} onClick={() => navigate(`#help?tab=guides`)}>📖 Startup Guides</SubTab>
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
                    <span style={{ fontSize: "0.75rem", color: "#999" }}>{m.userEmail} · {new Date(m.createdAt).toLocaleDateString()}</span>
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
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
    </Card>
  );
}

function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/courses", { headers }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const SectionBox = styled.div`background:#fff;border-radius:20px;border:1px solid #e0e0e0;padding:24px;margin-bottom:24px;`;
  const SectionBoxTitle = styled.h4`font-weight:700;font-size:1rem;color:#2c3e50;margin-bottom:16px;display:flex;align-items:center;gap:8px;`;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {courses.length === 0 ? <SectionBox data-aos="fade-up"><p style={{color:"#594048",fontSize:"0.85rem"}}>No courses yet.</p></SectionBox> : courses.map((c, i) => (
        <SectionBox key={c.id || i} data-aos="fade-up" data-aos-delay={i * 30} style={{padding:0,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",cursor:"pointer"}}
            onClick={() => setExpandedCourse(expandedCourse === (c.id || i) ? null : (c.id || i))}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:"1.8rem"}}>{c.emoji || "📚"}</span>
              <div>
                <h4 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#2c3e50"}}>{c.title}</h4>
                <span style={{fontSize:"0.78rem",color:"#594048"}}>{c.instructor} · {c.level || "N/A"} · {c.duration || "N/A"}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
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
  );
}

function ProgressSection() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/admin/users", { headers }).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/courses", { headers }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const mentors = users.filter(u => u.role === "mentor");
  const mentees = users.filter(u => u.role === "mentee");
  const topMentors = [...mentors].sort((a, b) => (b.courseCount || courses.filter(c => c.instructor?.toLowerCase() === b.name?.toLowerCase()).length) - (a.courseCount || courses.filter(c => c.instructor?.toLowerCase() === a.name?.toLowerCase()).length)).slice(0, 5);
  const topMentees = [...mentees].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 5);
  const topCourses = [...courses].sort((a, b) => ((b.enrolledMentees || b.enrolled || []).length) - ((a.enrolledMentees || a.enrolled || []).length)).slice(0, 5);
  const SectionBox = styled.div`background:#fff;border-radius:20px;border:1px solid #e0e0e0;padding:24px;margin-bottom:24px;`;
  const SectionBoxTitle = styled.h4`font-weight:700;font-size:1rem;color:#2c3e50;margin-bottom:16px;display:flex;align-items:center;gap:8px;`;
  const RankRow = styled.div`display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;&:last-child{border-bottom:none}`;
  const RankNum = styled.div`width:28px;height:28px;border-radius:50%;background:${p => p.$c || "#b50064"};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.8rem;flex-shrink:0;`;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
      <SectionBox data-aos="fade-up">
        <SectionBoxTitle>🏆 Top 5 Mentors</SectionBoxTitle>
        {topMentors.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No mentors yet.</p> : topMentors.map((m, i) => (
          <RankRow key={m.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#006590"}>{i + 1}</RankNum>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#006590",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,color:"#fff",flexShrink:0}}>{m.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{m.name}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>{courses.filter(c => c.instructor?.toLowerCase() === m.name?.toLowerCase()).length} courses</span></div>
            <Badge $c="#006590">{m.verified ? "Verified" : "Pending"}</Badge>
          </RankRow>
        ))}
      </SectionBox>
      <SectionBox data-aos="fade-up" data-aos-delay="100">
        <SectionBoxTitle>🏆 Top 5 Mentees</SectionBoxTitle>
        {topMentees.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No mentees yet.</p> : topMentees.map((m, i) => (
          <RankRow key={m.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#b50064"}>{i + 1}</RankNum>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,color:"#fff",flexShrink:0}}>{m.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{m.name}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>Progress: {m.progress || 0}%</span></div>
            <Badge $c={m.verified ? "#2e7d32" : "#f57f17"}>{m.verified ? "Verified" : "Pending"}</Badge>
          </RankRow>
        ))}
      </SectionBox>
      <SectionBox data-aos="fade-up" data-aos-delay="200">
        <SectionBoxTitle>🏆 Top 5 Courses</SectionBoxTitle>
        {topCourses.length === 0 ? <p style={{color:"#594048",fontSize:"0.85rem"}}>No courses yet.</p> : topCourses.map((c, i) => (
          <RankRow key={c.id}>
            <RankNum $c={i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#cca800"}>{i + 1}</RankNum>
            <div style={{flex:1}}><strong style={{fontSize:"0.9rem",display:"block",color:"#2c3e50"}}>{c.title}</strong><span style={{fontSize:"0.78rem",color:"#594048"}}>{c.instructor} · {c.level} · {(c.enrolledMentees || c.enrolled || []).length} enrolled</span></div>
            <Badge $c="#27AE60">{(c.enrolledMentees || c.enrolled || []).length} mentees</Badge>
          </RankRow>
        ))}
      </SectionBox>
    </div>
  );
}

const tabs = [
  { key: "overview", label: "📊 Overview", comp: DashboardOverview },
  { key: "mentors", label: "👨‍🏫 Mentors", comp: MentorsSection },
  { key: "mentees", label: "👩‍🎓 Mentees", comp: MenteesSection },
  { key: "courses", label: "📚 Courses", comp: CoursesSection },
  { key: "progress", label: "📈 Progress", comp: ProgressSection },
  { key: "gradebook", label: "📋 Gradebook", comp: GradebookSection },
  { key: "notifications", label: "🔔 Notifications", comp: NotificationsSection },
  { key: "analytics", label: "📈 Analytics", comp: AnalyticsSection },
  { key: "help", label: "❓ Help Center", comp: HelpCenterSection },
];

const AdminPageLayout = styled.div`display:flex;min-height:100vh;background:${p => p.theme.colors.background};`;
const AdminPageMain = styled.main`flex:1;margin-left:280px;padding:0 ${p => p.theme.spacing.xl} ${p => p.theme.spacing.xl};@media(min-width:${p => p.theme.breakpoints.mobile}) and (max-width:${p => p.theme.breakpoints.tablet}){margin-left:0;padding:${p => p.theme.spacing.lg}}@media(max-width:${p => p.theme.breakpoints.mobile}){margin-left:0;padding:${p => p.theme.spacing.sm}}`;
const AdminPageTitle = styled.h2`font-size:1.6rem;font-weight:700;color:${p => p.theme.colors.textPrimary};margin-bottom:24px;@media(max-width:${p => p.theme.breakpoints.mobile}){font-size:1.3rem;margin-bottom:16px}`;

export default function AdminDashboard() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const t = location.hash.replace("#", "");
    if (t && tabs.find(tab => tab.key === t)) { setActiveTab(t); }
    else { setActiveTab("overview"); }
  }, [location]);
  const ActiveComponent = tabs.find(t => t.key === activeTab)?.comp || DashboardOverview;
  return (
    <AdminPageLayout>
      <AdminSidebar activeTab={activeTab} onTabChange={(k) => { setActiveTab(k); navigate(`#${k}`); }} />
      <AdminPageMain>
        <TopBar theme={theme} setTheme={setTheme} />
        <AdminPageTitle>{tabs.find(t => t.key === activeTab)?.label || "Dashboard"}</AdminPageTitle>
        <ActiveComponent />
      </AdminPageMain>
    </AdminPageLayout>
  );
}
