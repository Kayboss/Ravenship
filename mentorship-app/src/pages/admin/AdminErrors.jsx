import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getErrorsPaginated, markErrorResolved, pruneOldErrors, batchResolveErrors } from "../../firebase/db";
import { Card, CardTitle, Badge } from "./adminStyles";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import { logger } from "../../lib/logger";

export default function AdminErrors() {
  const [errors, setErrors] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  useEffect(() => { AOS.init({ once: true }); }, []);
  useEffect(() => {
    pruneOldErrors(1);
    setLoading(true);
    getErrorsPaginated(50, null).then(async ({ items, lastDoc: ld, hasMore: hm }) => {
      const now = Date.now();
      const cutoff = 14 * 86400000;
      const oldUnresolved = items.filter(e => {
        if (e.resolved) return false;
        const t = e.timestamp?.toDate ? e.timestamp.toDate().getTime() : new Date(e.timestamp).getTime();
        return (now - t) > cutoff;
      });
      if (oldUnresolved.length > 0) {
        await batchResolveErrors(oldUnresolved.map(e => e.id));
        items.forEach(e => { if (oldUnresolved.find(r => r.id === e.id)) e.resolved = true; });
      }
      setErrors(items);
      setLastDoc(ld);
      setHasMore(hm);
      setLoading(false);
    }).catch(e => { logger.error("getErrors error:", e); setLoading(false); });
  }, []);
  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    getErrorsPaginated(50, lastDoc).then(({ items, lastDoc: ld, hasMore: hm }) => {
      setErrors(prev => [...prev, ...items]);
      setLastDoc(ld);
      setHasMore(hm);
      setLoading(false);
    }).catch(e => { logger.error("loadMore error:", e); setLoading(false); });
  };
  const doResolve = (id) => {
    setResolving(id);
    markErrorResolved(id).then(() => { setErrors(prev => prev.map(e => e.id === id ? {...e, resolved: true} : e)); }).catch(e => logger.error("markErrorResolved error:", e)).finally(() => setResolving(null));
  };
  if (loading && errors.length === 0) return <Card data-aos="fade-up"><LoadingSpinner label="Loading errors..." fullHeight /></Card>;
  return (
    <Card data-aos="fade-up">
      <style>{`
        .err-list{overflow-x:auto;max-width:100%}
        .err-row{padding:20px 24px;border-radius:12px;border-left:5px solid;max-width:100%;box-shadow:0 1px 4px rgba(0,0,0,0.07)}
        .err-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
        .err-info{flex:1;min-width:0}
        .err-meta{display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-left:12px}
        .err-msg{font-weight:700;font-size:0.9rem;color:#2c3e50;margin-bottom:6px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word}
        .err-detail{font-size:0.75rem;color:#666;margin-bottom:3px;word-break:break-all}
        .err-stack-summary{font-size:0.78rem;color:#b50064;cursor:pointer;font-weight:600;padding:4px 0}
        .err-stack-pre{font-size:0.68rem;color:#444;background:#f5f5f5;padding:12px;border-radius:8px;margin-top:8px;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-all;border:1px solid #e0e0e0}
        .err-time{font-size:0.7rem;color:#999}
        .err-resolve-btn{margin-top:12px;padding:8px 20px;border-radius:6px;border:1px solid #2e7d32;background:transparent;color:#2e7d32;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;min-height:36px;transition:all 0.15s}
        .err-resolve-btn:hover{background:#2e7d32;color:#fff}
        .err-resolve-btn:disabled{opacity:0.5;cursor:not-allowed}
        .err-load-btn{margin-top:16px;padding:10px 20px;border-radius:8px;border:1px solid #b50064;background:transparent;color:#b50064;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;width:100%;min-height:40px;transition:all 0.15s}
        .err-load-btn:hover{background:#b50064;color:#fff}
        .err-load-btn:disabled{opacity:0.5;cursor:not-allowed}
        @media(max-width:768px){
          .err-row{padding:16px 18px}
        }
        @media(max-width:480px){
          .err-row{padding:14px 16px}
          .err-top{flex-direction:column;gap:10px}
          .err-meta{flex-direction:row;flex-wrap:wrap;align-items:center;align-self:flex-start;gap:6px;margin-left:0}
          .err-msg{font-size:0.85rem}
        }
      `}</style>
      <CardTitle>⚠️ Error Log</CardTitle>
      <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:16}}>Unhandled errors and exceptions reported from the client.</p>
      {errors.length === 0 && !loading ? <p style={{color:"#594048"}}>No errors recorded.</p> : (
        <>
          <div className="err-list" style={{display:"flex",flexDirection:"column",gap:12}}>
            {errors.map((e, i) => {
              const time = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
              return (
                <div key={e.id || i} className="err-row" style={{background:e.resolved?"#f9f9f9":"#fff7f7",borderLeftColor:e.resolved?"#2e7d32":"#e53935"}}>
                  <div className="err-top">
                    <div className="err-info">
                      <div className="err-msg">{e.message || "Unknown error"}</div>
                      {e.url && <div className="err-detail">URL: {e.url}</div>}
                      {e.userName && <div className="err-detail">User: {e.userName} ({e.userRole})</div>}
                      {e.stack && (
                        <details style={{marginTop:4}}>
                          <summary className="err-stack-summary">Stack Trace</summary>
                          <pre className="err-stack-pre">{e.stack}</pre>
                        </details>
                      )}
                    </div>
                    <div className="err-meta">
                      <Badge $c={e.resolved?"#2e7d32":"#e53935"}>{e.resolved?"Resolved":"Open"}</Badge>
                      <span className="err-time">{time.toLocaleDateString()} {time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  </div>
                  {!e.resolved && (
                    <button disabled={resolving === e.id} onClick={() => doResolve(e.id)} className="err-resolve-btn">
                      {resolving === e.id ? "..." : "✓ Mark Resolved"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {hasMore && (
            <button onClick={loadMore} disabled={loading} className="err-load-btn">
              {loading ? "Loading..." : `Load More (${errors.length}+)`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
