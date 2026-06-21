import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../firebase/auth";
import { getUsers, getAnnouncements, getAnalytics, getSubmissions } from "../../firebase/db";
import { db } from "../../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  Card, CardTitle, KpiGrid, KpiCard, KpiIcon, KpiValue, KpiLabel, KpiTrend,
  DashboardGrid, UserTable, UTh, UTd, URow, RoleBadge, StatusDot,
  ChartCard, ChartBar, ChartGrid, SectionTitle, AnnTag
} from "./adminStyles";

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();
  const user = getStoredUser() || { name: "Admin" };
  const [weekData, setWeekData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getAnalytics().then(d => setData(d)).catch(() => {});
    getUsers().then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    Promise.all([
      getAnnouncements(),
      getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")))
    ]).then(([ann, notifSnap]) => {
      const notifs = notifSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const merged = [...(Array.isArray(ann) ? ann : []), ...notifs];
      merged.sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return tb - ta;
      });
      setNotifs(merged);
    }).catch(() => {});
    getSubmissions({}).then(subs => {
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const counts = [0,0,0,0,0,0,0];
      const now = new Date();
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
      subs.forEach(s => {
        const ts = s.submittedAt?.toDate ? s.submittedAt.toDate() : new Date(s.submittedAt);
        if (ts >= startOfWeek) counts[ts.getDay()]++;
      });
      const max = Math.max(...counts, 1);
      setWeekData(days.map((d, i) => ({ day: d, val: Math.round((counts[i]/max)*100) })));
    }).catch(() => {});
    getUsers().then(allUsers => {
      const cities = {};
      allUsers.forEach(u => { const c = u.city || "Unknown"; cities[c] = (cities[c]||0)+1; });
      const total = allUsers.length || 1;
      setSourceData(Object.entries(cities).map(([l, v]) => ({ l, v: Math.round((v/total)*100), c: "#b50064" })));
    }).catch(() => {});
  }, []);
  const filteredUsers = roleFilter === "all" ? users : users.filter(u => u.role === roleFilter);
  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 18) return "Good afternoon"; return "Good evening"; })();
  const totalUsers = data ? data.total : users.length;
  const mentors = data ? data.mentors : users.filter(u => u.role === "mentor").length;
  const mentees = data ? data.mentees : users.filter(u => u.role === "mentee").length;
  return (
    <>
      <style>{`
        .um-header{padding:16px 20px;borderBottom:1px solid #e0e0e0;display:flex;justifyContent:space-between;alignItems:center;flexWrap:wrap;gap:12px}
        .um-table-wrap{overflowX:auto}
        .um-cards{display:none}
        @media(max-width:768px){
          .um-table-wrap{display:none}
          .um-cards{display:flex;flexDirection:column;gap:6px;padding:10px 14px}
        }
        @media(min-width:769px){.um-cards{display:none!important}}
      `}</style>
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
        </KpiCard>
        <KpiCard $border="#0298D7">
          <KpiIcon $bg="#0298D7">🧠</KpiIcon>
          <KpiValue>{mentors} vs {mentees}</KpiValue>
          <KpiLabel>Mentors vs Mentees</KpiLabel>
          <KpiTrend>{mentors > 0 ? "1:" + Math.round(mentees / mentors) : "—"}</KpiTrend>
        </KpiCard>
        <KpiCard $border="#DC207E">
          <KpiIcon $bg="#DC207E">✅</KpiIcon>
          <KpiValue>{data?.completionRate ?? 0}%</KpiValue>
          <KpiLabel>Completion Rate</KpiLabel>
        </KpiCard>
        <KpiCard $border="#cca800">
          <KpiIcon $bg="#cca800">📚</KpiIcon>
          <KpiValue>{data?.totalCourses ?? 0}</KpiValue>
          <KpiLabel>Total Courses</KpiLabel>
        </KpiCard>
      </KpiGrid>

      <DashboardGrid data-aos="fade-up">
        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          <Card style={{padding:0,overflow:"hidden",marginBottom:0}}>
            <div className="um-header">
              <CardTitle style={{margin:0,fontSize:"clamp(0.9rem, 3vw, 1.05rem)"}}>User Management</CardTitle>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #e0e0e0",background:"#fff",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit",minHeight:36}}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="mentor">Mentors</option>
                  <option value="mentee">Mentees</option>
                </select>
                <button style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#b50064",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:"0.78rem",minHeight:36}} onClick={() => navigate("/dashboard/admin/mentors")}>View All</button>
              </div>
            </div>

            <div className="um-table-wrap">
              <UserTable>
                <thead><tr><UTh>User</UTh><UTh>Role</UTh><UTh>Progress</UTh><UTh>Status</UTh></tr></thead>
                <tbody>
                  {filteredUsers.slice(0,6).map((u,i) => (
                    <URow key={u.id || i} onClick={() => navigate(u.role === "mentor" ? "/dashboard/admin/mentors" : "/dashboard/admin/mentees")}>
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
                      <UTd><RoleBadge $role={u.role}>{u.role === "admin" ? "Admin" : u.role === "mentor" ? "Mentor" : "Mentee"}</RoleBadge></UTd>
                      <UTd>{u.verified ? <span style={{color:"#27AE60",fontWeight:600,fontSize:"0.78rem"}}>✅ Verified</span> : <span style={{color:"#f57f17",fontWeight:600,fontSize:"0.78rem"}}>⏳ Pending</span>}</UTd>
                      <UTd><span style={{display:"flex",alignItems:"center",fontSize:"0.78rem",fontWeight:600,color:u.verified ? "#27AE60" : "#594048"}}><StatusDot $online={!!u.verified} />{u.verified ? "Active" : "Inactive"}</span></UTd>
                    </URow>
                  ))}
                </tbody>
              </UserTable>
            </div>

            <div className="um-cards">
              {filteredUsers.slice(0,6).map((u,i) => (
                <div key={u.id || i} className="um-card" onClick={() => navigate(u.role === "mentor" ? "/dashboard/admin/mentors" : "/dashboard/admin/mentees")} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f9f9f9",borderRadius:10,cursor:"pointer"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:u.role === "mentor" ? "#b50064" : "#0298D7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>
                    {u.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:"0.82rem",color:"#2c3e50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                  </div>
                  <RoleBadge $role={u.role}>{u.role === "admin" ? "Admin" : u.role === "mentor" ? "Mentor" : "Mentee"}</RoleBadge>
                  <span style={{display:"flex",alignItems:"center",fontSize:"0.7rem",fontWeight:600,color:u.verified ? "#27AE60" : "#f57f17",flexShrink:0}}>
                    <StatusDot $online={!!u.verified} />{u.verified ? "✓" : "⏳"}
                  </span>
                </div>
              ))}
              {filteredUsers.length === 0 && <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:20}}>No users found.</p>}
            </div>

            {filteredUsers.length > 6 && (
              <div style={{borderTop:"1px solid #e0e0e0",padding:"12px 20px",textAlign:"center"}}>
                <button style={{border:"none",background:"transparent",color:"#b50064",fontWeight:600,cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit"}} onClick={() => navigate("/dashboard/admin/mentors")}>View All Users ({filteredUsers.length})</button>
              </div>
            )}
          </Card>

          <ChartGrid>
            <ChartCard>
              <SectionTitle>Weekly Engagement</SectionTitle>
              <div style={{display:"flex",alignItems:"flex-end",height:160,gap:8}}>
                {weekData.map((d, i) => (
                  <ChartBar key={i} $active={i === 3 || i === 5} style={{height:`${d.val}%`,flex:1}} />
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:"0.72rem",color:"#594048"}}>
                {weekData.map((d,i) => <span key={i}>{d.day}</span>)}
              </div>
            </ChartCard>
            <ChartCard>
              <SectionTitle>Enrollment Sources</SectionTitle>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {sourceData.length === 0 ? (
                  <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:24}}>No enrollment data yet.</p>
                ) : sourceData.map((s, i) => (
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",marginBottom:6}}><span style={{color:"#2c3e50"}}>{s.l}</span><span style={{fontWeight:700}}>{s.v}%</span></div>
                    <div style={{height:8,borderRadius:4,background:"#e4e2e1",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,background:["#b50064","#0298D7","#cca800","#27AE60","#e53935","#8e44ad"][i%6],width:`${s.v}%`}} />
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
            <span style={{fontSize:"1.3rem",cursor:"pointer",color:"#b50064"}} onClick={() => navigate("/dashboard/admin/notifications")}>+</span>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>
            {notifs.length === 0 ? (
              <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:24}}>No announcements yet.</p>
            ) : notifs.slice(0,5).map((n,i) => (
              <div key={n.id || i} style={{cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <AnnTag $c={i === 0 ? "#b50064" : i === 1 ? "#006590" : i === 3 ? "#e53935" : "#cca800"}>{i === 0 ? "System Update" : i === 1 ? "Event" : i === 3 ? "Urgent" : "Community"}</AnnTag>
                  <span style={{fontSize:"0.7rem",color:"#999"}}>{n.createdAt ? new Date(n.createdAt.toDate ? n.createdAt.toDate() : n.createdAt).toLocaleDateString() : "Today"}</span>
                </div>
                <h5 style={{margin:"0 0 4px",fontWeight:700,fontSize:"0.85rem",color:"#2c3e50"}}>{n.title}</h5>
                <p style={{margin:0,fontSize:"0.78rem",color:"#594048",lineHeight:1.4}}>{n.message}</p>
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid #e0e0e0",marginTop:16,paddingTop:16}}>
            <button style={{width:"100%",border:"none",background:"transparent",color:"#b50064",fontWeight:600,cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit"}} onClick={() => navigate("/dashboard/admin/notifications")}>Manage All Feed Items</button>
          </div>
        </Card>
      </DashboardGrid>
    </>
  );
}
