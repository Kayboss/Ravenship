import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getErrors, markErrorResolved } from "../../firebase/db";
import { Card, CardTitle, Badge } from "./adminStyles";

export default function AdminErrors() {
  const [errors, setErrors] = useState([]);
  const [resolving, setResolving] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  const load = () => getErrors(50).then(setErrors).catch(e => console.error("getErrors error:", e));
  useEffect(() => { load(); }, []);
  const doResolve = (id) => {
    setResolving(id);
    markErrorResolved(id).then(() => { setErrors(prev => prev.map(e => e.id === id ? {...e, resolved: true} : e)); }).catch(e => console.error("markErrorResolved error:", e)).finally(() => setResolving(null));
  };
  return (
    <Card data-aos="fade-up">
      <style>{`
        .err-row{padding:12px 16px;border-radius:12;border-left:4px solid;overflow:hidden}
        .err-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
        .err-info{flex:1;min-width:0}
        .err-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
        @media(max-width:480px){
          .err-top{flex-direction:column;gap:8px}
          .err-meta{flex-direction:row;flex-wrap:wrap;align-items:center;align-self:flex-start;gap:4px}
          .err-meta span{white-space:normal}
        }
      `}</style>
      <CardTitle>⚠️ Error Log</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Unhandled errors and exceptions reported from the client.</p>
      {errors.length === 0 ? <p style={{color:"#594048"}}>No errors recorded.</p> : (
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
          {errors.map((e, i) => {
            const time = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
            return (
              <div key={e.id || i} className="err-row" style={{background:e.resolved?"#f9f9f9":"#fff7f7",borderLeftColor:e.resolved?"#2e7d32":"#e53935"}}>
                <div className="err-top">
                  <div className="err-info">
                    <div style={{fontWeight:700,fontSize:"0.85rem",color:"#2c3e50",marginBottom:4}}>{e.message || "Unknown error"}</div>
                    {e.url && <div style={{fontSize:"0.72rem",color:"#594048",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>URL: {e.url}</div>}
                    {e.userName && <div style={{fontSize:"0.72rem",color:"#594048",marginBottom:2}}>User: {e.userName} ({e.userRole})</div>}
                    {e.stack && (
                      <details style={{marginTop:4}}>
                        <summary style={{fontSize:"0.75rem",color:"#b50064",cursor:"pointer",fontWeight:600}}>Stack Trace</summary>
                        <pre style={{fontSize:"0.65rem",color:"#594048",background:"#f0f0f0",padding:8,borderRadius:8,marginTop:4,maxHeight:120,overflow:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{e.stack}</pre>
                      </details>
                    )}
                  </div>
                  <div className="err-meta">
                    <Badge $c={e.resolved?"#2e7d32":"#e53935"}>{e.resolved?"Resolved":"Open"}</Badge>
                    <span style={{fontSize:"0.68rem",color:"#999",whiteSpace:"nowrap"}}>{time.toLocaleDateString()} {time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                </div>
                {!e.resolved && (
                  <button disabled={resolving === e.id} onClick={() => doResolve(e.id)} style={{marginTop:8,padding:"6px 14px",borderRadius:6,border:"1px solid #2e7d32",background:"transparent",color:"#2e7d32",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit",minHeight:34}}>
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
