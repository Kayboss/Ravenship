import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getActivities } from "../../firebase/db";
import { Card, CardTitle } from "./adminStyles";

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    getActivities(50).then(setActivities).catch(() => {});
  }, []);
  return (
    <Card data-aos="fade-up">
      <CardTitle>📊 Recent Activity Log</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Track all user actions across the platform.</p>
      {activities.length === 0 ? <p style={{color:"#594048"}}>No activity recorded yet.</p> : (
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
          {activities.map((a, i) => {
            const time = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            return (
              <div key={a.id || i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i%2===0?"#fafafa":"#fff",borderRadius:10,fontSize:"0.85rem",overflow:"hidden"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#fff",flexShrink:0}}>{a.userName?.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <strong style={{color:"#2c3e50"}}>{a.action}</strong>
                  <span style={{color:"#594048",marginLeft:6,fontSize:"0.78rem"}}>{a.detail || ""}</span>
                  <div style={{fontSize:"0.72rem",color:"#999",marginTop:2}}>{a.userName} · {a.userRole}</div>
                </div>
                <span style={{fontSize:"0.7rem",color:"#999",whiteSpace:"nowrap"}}>{time.toLocaleDateString()} {time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
