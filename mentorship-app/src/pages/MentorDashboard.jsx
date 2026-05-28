import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate, useParams } from "react-router-dom";
import { MentorSidebar } from "../components/layout/MentorSidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${(props) => props.theme.spacing.sm};
  }
`;

const HeaderBar = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-bottom: ${(props) => props.theme.spacing.md};
  }

  @media (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

const HeaderLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${(props) => props.theme.colors.secondary};
`;

const HeaderTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.heading2};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  color: ${(props) => props.theme.colors.textPrimary};
  margin-top: 4px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const HeaderSub = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const HeaderActions2 = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    width: 100%;
    button { width: 100%; text-align: center; }
  }
  @media (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-top: 0;
  }
`;

const OutlineBtn = styled.button`
  padding: 10px 24px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.colors.secondary};
  background: transparent;
  color: ${(props) => props.theme.colors.secondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.secondary}10;
  }
`;

const PrimaryBtn = styled.button`
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.theme.colors.primaryContainer};
  color: white;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 12px ${(props) => props.theme.colors.primary}30;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Grid13 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    gap: 16px;
    margin-bottom: ${(props) => props.theme.spacing.md};
  }

  @media (min-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: 8fr 4fr;
  }
`;

const GlassCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
`;

const CardTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.heading3};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
`;

const PeriodSelect = styled.select`
  border: none;
  background: ${(props) => props.theme.colors.surface};
  padding: 4px 8px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  outline: none;
  cursor: pointer;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    margin-bottom: 16px;
    gap: 12px;
  }
`;

const Metric = styled.div`
  padding: 16px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.colors.outline}50;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: 12px;
  }
`;

const MetricLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 600;
`;

const MetricValue = styled.div`
  font-size: ${(props) => props.theme.typography.heading2};
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const MetricTrend = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.$positive ? props.theme.colors.success : props.theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

const TrendChart = styled.div`
  height: 80px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 16px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, ${(props) => props.theme.colors.primary}10, transparent);
    pointer-events: none;
    border-radius: 12px;
  }
`;

const TrendBar = styled.div`
  flex: 1;
  height: ${(props) => props.$height}%;
  background: ${(props) => props.$active ? props.theme.colors.primaryContainer : props.theme.colors.primary}20;
  border-radius: 6px 6px 0 0;
  transition: all 0.5s;

  ${(props) => props.$active && `background: ${props.theme.colors.primaryContainer};`}

  &:hover {
    opacity: 0.8;
  }
`;

const GradingList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  max-height: 320px;
  overflow-y: auto;
`;

const GradingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline}20;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary}40;
    background: ${(props) => props.theme.colors.background};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: 10px;
  }
`;

const GradingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GradingAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) => props.$color || props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const GradingTitle = styled.p`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const GradingSub = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 2px;
`;

const NewBadge = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.error}20;
  color: ${(props) => props.theme.colors.error};
  font-size: 0.7rem;
  font-weight: 700;
`;

const NewCount = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.error}20;
  color: ${(props) => props.theme.colors.error};
  font-size: 0.75rem;
  font-weight: 700;
`;

const ViewAllBtn = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 12px;

  &:hover {
    background: ${(props) => props.theme.colors.primary}10;
  }
`;

const TableCard = styled(GlassCard)`
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-bottom: ${(props) => props.theme.spacing.md};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Th = styled.th`
  text-align: left;
  padding-bottom: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}50;
`;

const Td = styled.td`
  padding: 20px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}20;
  font-size: 0.9rem;
`;

const Tr = styled.tr`
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.background};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StudentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.$color || props.theme.colors.secondary}30;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$bg || props.theme.colors.secondary}20;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.$color || props.theme.colors.secondary};
`;

const StudentName = styled.p`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const StudentEmail = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const PathBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.secondary}15;
  color: ${(props) => props.theme.colors.secondary};
  font-size: 0.75rem;
  font-weight: 600;
`;

const MenteeCards = styled.div`
  display: none;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const MenteeCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.outline}30;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MenteeCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenteeCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;
`;

const ProgressBar2 = styled.div`
  flex: 1;
  height: 8px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 50px;
  overflow: hidden;
`;

const ProgressFill2 = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: ${(props) => props.$width >= 100 ? props.theme.colors.success : props.theme.colors.primaryContainer};
  border-radius: 50px;
  transition: width 0.8s;
`;

const ProgressLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${(props) => props.$width >= 100 ? props.theme.colors.success : props.theme.colors.textPrimary};
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.$online ? props.theme.colors.success : props.theme.colors.outline};
  margin-right: 6px;
  animation: ${(props) => props.$online ? "pulse 2s infinite" : "none"};
`;

const ChatBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;

  &:hover {
    background: ${(props) => props.theme.colors.primary}15;
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled.div`
  border-radius: 24px;
  height: 260px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, ${(props) => props.$color1 || props.theme.colors.primary}20, ${(props) => props.$color2 || props.theme.colors.secondary}20);
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    height: 200px;
  }
`;

const CourseOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, ${(props) => props.theme.colors.textPrimary}E0, transparent);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const CourseBadge2 = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.primaryContainer};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  align-self: flex-start;
`;

const CourseTitle2 = styled.h4`
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
`;

const CourseCount = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
`;

const AddCourseCard = styled.div`
  border-radius: 24px;
  height: 260px;
  border: 2px dashed ${(props) => props.theme.colors.outline};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background: ${(props) => props.theme.colors.surface};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    height: 200px;
  }
`;

const AddIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.primaryContainer};
  transition: transform 0.3s;

  ${AddCourseCard}:hover & {
    transform: scale(1.1);
  }
`;

const AddText = styled.p`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const AddSubtext = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const trendingValues = [40, 65, 50, 85, 45, 70, 60, 95];
const gradingQueue = [
  { initials: "JD", name: "UX Case Study", by: "John Doe", time: "2h ago" },
  { initials: "AS", name: "Brand Strategy", by: "Alice Smith", time: "5h ago" },
  { initials: "ML", name: "Python Final", by: "Mark Lee", time: "1d ago" },
  { initials: "KR", name: "Research Paper", by: "Kate Ross", time: "1d ago" },
];

const mentees = [
  { name: "Alex Rivera", email: "alex.riv@example.com", path: "Advanced UI Design", progress: 72, online: true, lastActive: "Today, 10:45 AM", initials: "AR", avatarColor: "#006590" },
  { name: "Jamie Chen", email: "j.chen@corp.com", path: "Brand Leadership", progress: 100, online: false, lastActive: "2 days ago", initials: "JC", avatarColor: "#b50064" },
  { name: "Sarah Kim", email: "s.kim@design.io", path: "UX Research", progress: 55, online: true, lastActive: "Today, 9:30 AM", initials: "SK", avatarColor: "#cca800" },
  { name: "David Park", email: "d.park@tech.dev", path: "Data Strategy", progress: 88, online: false, lastActive: "Yesterday", initials: "DP", avatarColor: "#0298D7" },
];

const activeCourses = [
  { title: "Advanced Interface Paradigms", badge: "Design", count: "45 Active", color1: "#b50064", color2: "#006590" },
  { title: "Brand Identity Architecture", badge: "Strategy", count: "32 Active", color1: "#006590", color2: "#0298D7" },
];

export const MentorDashboard = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  let user = { name: "Prof. Sarah" };
  try { const s = localStorage.getItem("user"); if (s) user = JSON.parse(s); } catch {}
  const mentorName = user.name || "Mentor";
  const [exporting, setExporting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [chattingId, setChattingId] = useState(null);
  const [addingProgram, setAddingProgram] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
    const token = localStorage.getItem("token");
    fetch("/api/mentor/dashboard", { headers: { Authorization: "Bearer " + token } })
      .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then(d => setDashboardData(d))
      .catch(() => {});
  }, []);
  const { gradingQueue = [], mentees = [], activeCourses = [] } = dashboardData || {};
  // activeCourses is still hardcoded in MentorDashboard but we'll use the API data

  return (
    <DashboardContainer>
      <MentorSidebar />
      <MainContent>
        <TopBar searchPlaceholder="Search mentees, courses, or tasks..." />

        <HeaderBar data-aos="fade-down">
          <div>
            <HeaderLabel>Mentor Central</HeaderLabel>
            <HeaderTitle>Good Morning, {mentorName}</HeaderTitle>
            <HeaderSub>You have 12 assignments to grade and 4 mentee meetings today.</HeaderSub>
          </div>
          <HeaderActions2>
            <OutlineBtn disabled={exporting} onClick={() => { setExporting(true); setActionMsg(null); fetch("/api/mentor/report", { method: "POST", headers: { Authorization: "Bearer " + localStorage.getItem("token") } }).then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }).then(() => { setExporting(false); setActionMsg("Report exported"); setTimeout(() => setActionMsg(null), 2000); }).catch(() => { setExporting(false); setActionMsg("Export failed"); setTimeout(() => setActionMsg(null), 2000); }); }}>{exporting ? "Exporting..." : "Export Report"}</OutlineBtn>
            <PrimaryBtn disabled={scheduling} onClick={() => { setScheduling(true); setActionMsg(null); fetch("/api/mentor/schedule-call", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({}) }).then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }).then(d => { setScheduling(false); setActionMsg(d.message); setTimeout(() => setActionMsg(null), 3000); }).catch(() => { setScheduling(false); setActionMsg("Scheduling failed"); setTimeout(() => setActionMsg(null), 2000); }); }}>{scheduling ? "Scheduling..." : "Schedule Call"}</PrimaryBtn>
          </HeaderActions2>
          {actionMsg && <p style={{fontSize:"0.85rem",color: actionMsg === "Report exported" ? "#2e7d32" : "#594048",fontWeight:600,margin:0}}>{actionMsg}</p>}
        </HeaderBar>

        <Grid13>
          <GlassCard data-aos="fade-up">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <PeriodSelect>
                <option>Last 30 Days</option>
                <option>Current Term</option>
                <option>Yearly</option>
              </PeriodSelect>
            </CardHeader>
            <MetricGrid>
              <Metric>
                <MetricLabel>👥 Total Mentees</MetricLabel>
                <MetricValue>128</MetricValue>
                <MetricTrend $positive>📈 12% vs last month</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>⭐ Avg. Grade</MetricLabel>
                <MetricValue>A-</MetricValue>
                <MetricTrend>Stable performance</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>📝 Completion Rate</MetricLabel>
                <MetricValue>94.2%</MetricValue>
                <MetricTrend $positive>📈 3% increase</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>⏰ Pending Tasks</MetricLabel>
                <MetricValue>24</MetricValue>
                <MetricTrend>High priority</MetricTrend>
              </Metric>
            </MetricGrid>
            <TrendChart>
              {trendingValues.map((v, i) => (
                <TrendBar key={i} $height={v} $active={i === 7} />
              ))}
            </TrendChart>
          </GlassCard>

          <GlassCard data-aos="fade-up" data-aos-delay="100" style={{ display: "flex", flexDirection: "column" }}>
            <CardHeader>
              <CardTitle>Grading Queue</CardTitle>
              <NewCount>12 New</NewCount>
            </CardHeader>
            <GradingList>
              {gradingQueue.map((item, i) => (
                <GradingItem key={i} onClick={() => navigate(`/dashboard/${role}/submissions`)}>
                  <GradingInfo>
                    <GradingAvatar>{item.initials}</GradingAvatar>
                    <div>
                      <GradingTitle>{item.name}</GradingTitle>
                      <GradingSub>{item.by} • {item.time}</GradingSub>
                    </div>
                  </GradingInfo>
                  <span style={{ color: "#594048", fontSize: "0.85rem", opacity: 0.5 }}>→</span>
                </GradingItem>
              ))}
            </GradingList>
            <ViewAllBtn onClick={() => navigate(`/dashboard/${role}/assignments`)}>View All Assignments</ViewAllBtn>
          </GlassCard>
        </Grid13>

        <TableCard data-aos="fade-up">
          <CardHeader>
            <CardTitle>Active Mentees</CardTitle>
            <ViewAllBtn style={{ width: "auto", padding: "8px 16px", border: "1px solid #e0e0e0", borderRadius: "50px" }} onClick={() => navigate(`/dashboard/${role}/my-courses`)}>Filter by Progress</ViewAllBtn>
          </CardHeader>
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <Th>Mentee Name</Th>
                  <Th>Current Path</Th>
                  <Th>Course Progress</Th>
                  <Th>Last Active</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {mentees.map((m, i) => (
                  <Tr key={i}>
                    <Td>
                      <StudentInfo>
                        <StudentAvatar $color={m.avatarColor} $bg={m.avatarColor}>{m.initials}</StudentAvatar>
                        <div>
                          <StudentName>{m.name}</StudentName>
                          <StudentEmail>{m.email}</StudentEmail>
                        </div>
                      </StudentInfo>
                    </Td>
                    <Td><PathBadge>{m.path}</PathBadge></Td>
                    <Td>
                      <ProgressCell>
                        <ProgressBar2>
                          <ProgressFill2 $width={m.progress} />
                        </ProgressBar2>
                        <ProgressLabel $width={m.progress}>{m.progress}%</ProgressLabel>
                      </ProgressCell>
                    </Td>
                    <Td style={{ color: "#594048" }}>{m.lastActive}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: m.online ? "#27AE60" : "#594048" }}>
                        <StatusDot $online={m.online} />
                        {m.online ? "Online" : "Offline"}
                      </span>
                    </Td>
                    <Td><ChatBtn disabled={chattingId === m.name} onClick={() => { setChattingId(m.name); setActionMsg(null); setTimeout(() => { setChattingId(null); setActionMsg(`Chat with ${m.name} coming soon`); setTimeout(() => setActionMsg(null), 2000); }, 600); }}>{chattingId === m.name ? "..." : "💬"}</ChatBtn></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
          <MenteeCards>
            {mentees.map((m, i) => (
              <MenteeCard key={i}>
                <MenteeCardRow>
                  <MenteeCardInfo>
                    <StudentAvatar $color={m.avatarColor} $bg={m.avatarColor}>{m.initials}</StudentAvatar>
                    <div>
                      <StudentName>{m.name}</StudentName>
                      <StudentEmail>{m.email}</StudentEmail>
                    </div>
                  </MenteeCardInfo>
                  <ChatBtn disabled={chattingId === m.name} onClick={() => { setChattingId(m.name); setActionMsg(null); setTimeout(() => { setChattingId(null); setActionMsg(`Chat with ${m.name} coming soon`); setTimeout(() => setActionMsg(null), 2000); }, 600); }}>{chattingId === m.name ? "..." : "💬"}</ChatBtn>
                </MenteeCardRow>
                <MenteeCardRow>
                  <PathBadge>{m.path}</PathBadge>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: m.online ? "#27AE60" : "#594048" }}>
                    <StatusDot $online={m.online} />
                    {m.online ? "Online" : "Offline"}
                  </span>
                </MenteeCardRow>
                <MenteeCardRow>
                  <ProgressCell style={{ minWidth: 0, flex: 1, gap: 8 }}>
                    <ProgressBar2 style={{ flex: 1 }}>
                      <ProgressFill2 $width={m.progress} />
                    </ProgressBar2>
                    <ProgressLabel $width={m.progress}>{m.progress}%</ProgressLabel>
                  </ProgressCell>
                  <span style={{ fontSize: "0.75rem", color: "#594048" }}>{m.lastActive}</span>
                </MenteeCardRow>
              </MenteeCard>
            ))}
          </MenteeCards>
        </TableCard>

        <div data-aos="fade-up">
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
            <ViewAllBtn style={{ width: "auto", color: "#006590" }} onClick={() => navigate(`/dashboard/${role}/my-courses`)}>Manage Curriculum ↗</ViewAllBtn>
          </CardHeader>
          <CoursesGrid>
            {activeCourses.map((c, i) => (
              <CourseCard key={i} $color1={c.color1} $color2={c.color2} onClick={() => navigate(`/dashboard/${role}/my-courses`)}>
                <CourseOverlay>
                  <CourseBadge2>{c.badge}</CourseBadge2>
                  <CourseTitle2>{c.title}</CourseTitle2>
                  <CourseCount>{c.count}</CourseCount>
                </CourseOverlay>
              </CourseCard>
            ))}
            <AddCourseCard onClick={() => { setAddingProgram(true); setActionMsg(null); fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") }, body: JSON.stringify({ title: "New Program", instructor: mentorName }) }).then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }).then(() => { setAddingProgram(false); setActionMsg("Program created! Manage it in My Courses."); setTimeout(() => setActionMsg(null), 3000); }).catch(() => { setAddingProgram(false); setActionMsg("Failed to create program"); setTimeout(() => setActionMsg(null), 2000); }); }}>
              <AddIcon>{addingProgram ? "..." : "+"}</AddIcon>
              <AddText>{addingProgram ? "Adding..." : "Add New Program"}</AddText>
              <AddSubtext>Design a new learning path</AddSubtext>
            </AddCourseCard>
          </CoursesGrid>
        </div>
      </MainContent>
    </DashboardContainer>
  );
};
