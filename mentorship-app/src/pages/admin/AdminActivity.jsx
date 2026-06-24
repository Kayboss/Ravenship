import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getActivitiesPaginated, pruneOldActivity } from "../../firebase/db";
import { Card, CardTitle } from "./adminStyles";

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    pruneOldActivity(3);
    setLoading(true);
    getActivitiesPaginated(50, null).then(({ items, lastDoc: ld, hasMore: hm }) => {
      setActivities(items);
      setLastDoc(ld);
      setHasMore(hm);
      setLoading(false);
    }).catch(e => { console.error("getActivities error:", e); setLoading(false); });
  }, []);
  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    getActivitiesPaginated(50, lastDoc).then(({ items, lastDoc: ld, hasMore: hm }) => {
      setActivities(prev => [...prev, ...items]);
      setLastDoc(ld);
      setHasMore(hm);
      setLoading(false);
    }).catch(e => { console.error("loadMore error:", e); setLoading(false); });
  };
  return (
    <Card data-aos="fade-up">
      <style>{`
        .act-row{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:10px;font-size:0.85rem;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
        .act-avatar{width:36px;height:36px;border-radius:50%;background:#b50064;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#fff;flex-shrink:0}
        .act-body{flex:1;min-width:0}
        .act-action{color:#2c3e50;font-weight:600}
        .act-detail{color:#594048;margin-left:6px;font-size:0.8rem}
        .act-user{font-size:0.73rem;color:#999;margin-top:3px}
        .act-time{font-size:0.7rem;color:#999;flex-shrink:0;white-space:nowrap}
        @media(max-width:640px){
          .act-row{gap:4px 10px;padding:10px 10px}
          .act-time{width:100%;white-space:normal;word-break:break-all;margin-left:48px}
        }
      `}</style>
      <CardTitle>📊 Recent Activity Log</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Track all user actions across the platform.</p>
      {activities.length === 0 && !loading ? <p style={{color:"#594048"}}>No activity recorded yet.</p> : (
        <>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
            {activities.map((a, i) => {
              const time = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
              return (
                <div key={a.id || i} className="act-row" style={{background:i%2===0?"#fafafa":"#fff"}}>
                    <div className="act-avatar">{a.userName?.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                    <div className="act-body">
                      <span className="act-action">{a.action}</span>
                      <span className="act-detail">{a.detail || ""}</span>
                      <div className="act-user">{a.userName} · {a.userRole}</div>
                    </div>
                    <span className="act-time">{time.toLocaleDateString()} {time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
              );
            })}
          </div>
          {hasMore && (
            <button onClick={loadMore} disabled={loading} style={{marginTop:16,padding:"10px 20px",borderRadius:8,border:"1px solid #b50064",background:"transparent",color:"#b50064",fontSize:"0.85rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%",minHeight:40}}>
              {loading ? "Loading..." : `Load More (${activities.length}+)`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
