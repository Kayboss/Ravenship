import styled from "styled-components";

export const Page = styled.div`display:flex;min-height:100vh;background:${p => p.theme.colors.background};`;
export const Main = styled.main`flex:1;margin-left:280px;padding:0 ${p => p.theme.spacing.xl} ${p => p.theme.spacing.xl};@media(max-width:${p => p.theme.breakpoints.mobile}){margin-left:0;padding:${p => p.theme.spacing.sm}}@media(min-width:${p => p.theme.breakpoints.mobile}) and (max-width:${p => p.theme.breakpoints.tablet}){margin-left:0;padding:${p => p.theme.spacing.lg}}`;

export const Card = styled.div`background:#fff;border-radius:20px;border:1px solid #e0e0e0;padding:24px;margin-bottom:24px;`;
export const CardTitle = styled.h4`font-weight:700;font-size:1.05rem;color:#2c3e50;margin-bottom:16px;`;
export const SubTab = styled.button`padding:10px 20px;border-radius:12px;border:none;background:${p => p.$active ? "#b50064" : "#fff"};color:${p => p.$active ? "#fff" : "#594048"};font-family:inherit;font-weight:${p => p.$active ? 700 : 500};font-size:0.85rem;cursor:pointer;transition:all 0.2s;border:1px solid ${p => p.$active ? "#b50064" : "#e0e0e0"};&:hover{opacity:0.9}`;
export const Table = styled.table`width:100%;border-collapse:collapse;font-size:0.85rem;`;
export const Th = styled.th`text-align:left;padding:10px 12px;border-bottom:2px solid #e0e0e0;color:#594048;font-weight:600;`;
export const Td = styled.td`padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#2c3e50;`;
export const Badge = styled.span`display:inline-block;padding:3px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;background:${p => p.$c}20;color:${p => p.$c};`;
export const Btn = styled.button`padding:6px 16px;border-radius:8px;border:none;background:${p => p.$red ? "#e53935" : p.$outline ? "transparent" : "#b50064"};color:${p => p.$outline ? "#b50064" : "#fff"};font-family:inherit;font-weight:600;font-size:0.8rem;cursor:pointer;border:${p => p.$outline ? "1px solid #b50064" : "none"};&:hover{opacity:0.85}&:disabled{opacity:0.5;cursor:not-allowed}`;
export const Input = styled.input`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;width:100%;box-sizing:border-box;`;
export const Textarea = styled.textarea`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;width:100%;box-sizing:border-box;resize:vertical;min-height:80px;`;
export const Select = styled.select`padding:8px 12px;border-radius:10px;border:1px solid #e0e0e0;font-family:inherit;font-size:0.85rem;background:#fff;`;

export const ModalOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;`;
export const ModalBox = styled.div`background:#fff;border-radius:20px;padding:32px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);`;
export const ModalTitle = styled.h3`font-weight:700;font-size:1.1rem;color:#2c3e50;margin-bottom:20px;`;
export const ViewBtn = styled.button`background:#1565c0;color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:0.78rem;cursor:pointer;font-family:inherit;white-space:nowrap;&:hover{opacity:0.85}`;
export const PdfOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;`;
export const PdfModalInner = styled.div`background:#fff;border-radius:16px;width:90%;max-width:800px;height:90vh;position:relative;overflow:hidden;`;
export const PdfCloseBtn = styled.button`position:absolute;top:10px;right:14px;background:#e53935;color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1.2rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;font-family:inherit;&:hover{opacity:0.85}`;

export const KpiGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:20px;margin-bottom:32px;`;
export const KpiCard = styled.div`background:${p => p.theme.colors.surface || "#fff"};border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);border-left:4px solid ${p => p.$border};border:1px solid ${p => p.theme.colors.outline}30;`;
export const KpiIcon = styled.div`width:40px;height:40px;border-radius:12px;background:${p => p.$bg}20;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:12px;`;
export const KpiValue = styled.div`font-size:1.8rem;font-weight:800;color:${p => p.theme.colors.textPrimary};`;
export const KpiLabel = styled.div`font-size:0.78rem;color:${p => p.theme.colors.textSecondary};font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-top:2px;`;
export const KpiTrend = styled.span`font-size:0.75rem;font-weight:700;color:${p => p.$positive ? "#27AE60" : p.theme.colors.textSecondary};display:flex;align-items:center;gap:4px;`;

export const DashboardGrid = styled.div`display:grid;grid-template-columns:2fr 1fr;gap:24px;@media(max-width:1024px){grid-template-columns:1fr;}`;
export const UserTable = styled.table`width:100%;border-collapse:collapse;font-size:0.85rem;`;
export const UTh = styled.th`text-align:left;padding:14px 16px;border-bottom:2px solid ${p => p.theme.colors.outline}30;color:${p => p.theme.colors.textSecondary};font-weight:600;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;`;
export const UTd = styled.td`padding:14px 16px;border-bottom:1px solid ${p => p.theme.colors.outline}15;color:${p => p.theme.colors.textPrimary};`;
export const URow = styled.tr`&:hover{background:${p => p.theme.colors.background};cursor:pointer;transition:all 0.15s;}`;
export const RoleBadge = styled.span`display:inline-block;padding:3px 12px;border-radius:50px;font-size:0.72rem;font-weight:700;background:${p => p.$role === "admin" ? "#fff3cd" : p.$role === "mentor" ? "#ffd9e3" : "#c8e6ff"};color:${p => p.$role === "admin" ? "#856404" : p.$role === "mentor" ? "#8d004d" : "#004a6c"};`;
export const StatusDot = styled.span`display:inline-block;width:8px;height:8px;border-radius:50%;background:${p => p.$online ? "#27AE60" : "#594048"};margin-right:6px;`;

export const ChartCard = styled.div`background:${p => p.theme.colors.surface || "#fff"};border-radius:16px;padding:20px;border:1px solid ${p => p.theme.colors.outline}30;`;
export const ChartBar = styled.div`width:100%;background:${p => p.$active ? "#b50064" : "#ffd9e3"};border-radius:6px 6px 0 0;transition:height 1s ease-out;`;
export const ChartGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:20px;@media(max-width:${p => p.theme.breakpoints.mobile}){grid-template-columns:1fr;}`;

export const SectionTitle = styled.h4`font-size:0.75rem;font-weight:700;color:${p => p.theme.colors.textSecondary};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;`;

export const AnnTag = styled.span`display:inline-block;padding:2px 10px;border-radius:50px;font-size:0.7rem;font-weight:700;background:${p => p.$c}20;color:${p => p.$c};`;

export const SectionBox = styled.div`background:#fff;border-radius:20px;border:1px solid #e0e0e0;padding:24px;margin-bottom:24px;`;
export const SectionBoxTitle = styled.h4`font-weight:700;font-size:1rem;color:#2c3e50;margin-bottom:16px;display:flex;align-items:center;gap:8px;`;
export const RankRow = styled.div`display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;&:last-child{border-bottom:none}`;
export const RankNum = styled.div`width:28px;height:28px;border-radius:50%;background:${p => p.$c || "#b50064"};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.8rem;flex-shrink:0;`;
export const StatGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px;`;
export const StatCard = styled.div`background:#fff;border-radius:16px;padding:20px;text-align:center;border:1px solid #e0e0e0;`;
export const StatNum = styled.div`font-size:1.8rem;font-weight:800;color:#2c3e50;`;
export const StatLabel = styled.div`font-size:0.75rem;color:#594048;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-top:4px;`;

export const AdminPageLayout = styled.div`display:flex;min-height:100vh;background:${p => p.theme.colors.background};`;
export const AdminPageMain = styled.main`flex:1;margin-left:280px;padding:0 ${p => p.theme.spacing.xl} ${p => p.theme.spacing.xl};@media(min-width:${p => p.theme.breakpoints.mobile}) and (max-width:${p => p.theme.breakpoints.tablet}){margin-left:0;padding:${p => p.theme.spacing.lg}}@media(max-width:${p => p.theme.breakpoints.mobile}){margin-left:0;padding:${p => p.theme.spacing.sm}}`;
export const AdminPageTitle = styled.h2`font-size:1.6rem;font-weight:700;color:${p => p.theme.colors.textPrimary};margin-bottom:24px;@media(max-width:${p => p.theme.breakpoints.mobile}){font-size:1.3rem;margin-bottom:16px}`;

export const BioModal = ({ user, onClose }) => {
  if (!user) return null;
  const dob = [user.dobMonth, user.dobDay, user.dobYear].filter(Boolean).join(" ");
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover"}} />
          ) : (
            <div style={{width:56,height:56,borderRadius:"50%",background:"#b50064",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:700,color:"#fff"}}>
              {user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
            </div>
          )}
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

export const Field = ({ label, value }) => (
  <div><strong style={{fontSize:"0.8rem",color:"#594048",display:"block",marginBottom:2}}>{label}</strong>
    <span style={{fontSize:"0.9rem",color:"#2c3e50"}}>{value}</span></div>
);
