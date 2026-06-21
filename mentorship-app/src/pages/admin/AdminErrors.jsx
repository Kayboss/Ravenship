import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getErrors, markErrorResolved } from "../../firebase/db";
import { Card, CardTitle, Badge } from "./adminStyles";

export default function AdminErrors() {
  const [errors, setErrors] = useState([]);
  const [resolving, setResolving] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  const load = () => getErrors(50).then(setErrors).catch(() => {});
  useEffect(() => { load(); }, []);
  const doResolve = (id) => {
    setResolving(id);
    markErrorResolved(id).then(() => { setErrors(prev => prev.map(e => e.id === id ? {...e, resolved: true} : e)); }).catch(() => {}).finally(() => setResolving(null));
  };
  return (
    <Card data-aos="fade-up">
      <CardTitle>⚠️ Error Log</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Unhandled errors and exceptions reported from the client.</p>
      {errors.length === 0 ? <p style={{color:"#594048"}}>No errors recorded.</p> : (
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
          {errors.map((e, i) => {
            const time = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
            return (
              <div key={e.id || i} style={{padding:"12px 16px",background:e.resolved?"#f9f9f9":"#fff7f7",borderRadius:12,borderLeft:`4px solid ${e.resolved?"#2e7d32":"#e53935"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:"0.85rem",color:"#2c3e50",marginBottom:4}}>{e.message || "Unknown error"}</div>
                    {e.url && <div style={{fontSize:"0.72rem",color:"#594048",marginBottom:2}}>URL: {e.url}</div>}
                    {e.userName && <div style={{fontSize:"0.72rem",color:"#594048",marginBottom:2}}>User: {e.userName} ({e.userRole})</div>}
                    {e.stack && (
                      <details style={{marginTop:4}}>
                        <summary style={{fontSize:"0.75rem",color:"#b50064",cursor:"pointer",fontWeight:600}}>Stack Trace</summary>
                        <pre style={{fontSize:"0.65rem",color:"#594048",background:"#f0f0f0",padding:8,borderRadius:8,marginTop:4,maxHeight:120,overflow:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{e.stack}</pre>
                      </details>
                    )}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <Badge $c={e.resolved?"#2e7d32":"#e53935"}>{e.resolved?"Resolved":"Open"}</Badge>
                    <span style={{fontSize:"0.7rem",color:"#999",whiteSpace:"nowrap"}}>{time.toLocaleDateString()} {time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                </div>
                {!e.resolved && (
                  <button disabled={resolving === e.id} onClick={() => doResolve(e.id)} style={{marginTop:8,padding:"4px 12px",borderRadius:6,border:"1px solid #2e7d32",background:"transparent",color:"#2e7d32",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    {resolving === e.id ? "..." : "✓ Mark Resolved"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
