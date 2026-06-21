import React, { useEffect, useState } from "react";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getUsers, getCourses, getSubmissions, addCourse, getAllGradebook } from "../firebase/db";
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

export const MentorDashboard = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  let user = getStoredUser() || { name: "Mentor" };
  const mentorName = user.name || "Mentor";
  const [exporting, setExporting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [chattingId, setChattingId] = useState(null);
  const [addingProgram, setAddingProgram] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalMentees: 0, avgGrade: "—", completionRate: 0, pendingTasks: 0, trendValues: [] });
  const [greeting, setGreeting] = useState("Good Morning");
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);
  useEffect(() => {
    if (!authReady) return;
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
    AOS.init({ duration: 800, once: true, offset: 50 });
    const mentor = getStoredUser();
    const mentorId = mentor?.id || mentor?.uid || "";
    Promise.all([getUsers(), getCourses(mentorId), getSubmissions({}), getAllGradebook()])
      .then(([users, courses, submissions, gradebook]) => {
        const mentees = (users || []).filter(u => (u.assignedMentor === mentorId || u.mentorId === mentorId) && u.role !== "mentor" && u.role !== "admin");
        const pending = (submissions || []).filter(s => s.status === "pending" || s.grade === undefined);
        const graded = (submissions || []).filter(s => s.score != null);
        const completion = submissions.length ? Math.round((graded.length / submissions.length) * 100) : 0;
        const allScores = gradebook.flatMap(g => Object.values(g.scores || {}).filter(v => typeof v === 'number'));
        const avg = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        const gradeLetter = avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F";
        const gradeDisplay = avg ? `${gradeLetter} (${avg}%)` : "—";
        const days = [0,0,0,0,0,0,0];
        const now = new Date();
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
        submissions.forEach(s => {
          const ts = s.submittedAt?.toDate ? s.submittedAt.toDate() : new Date(s.submittedAt);
          if (ts >= startOfWeek) days[ts.getDay()]++;
        });
        const max = Math.max(...days, 1);
        setKpis({
          totalMentees: mentees.length,
          avgGrade: gradeDisplay,
          completionRate: completion,
          pendingTasks: pending.length,
          trendValues: days.map(v => Math.round((v/max)*100))
        });
        setDashboardData({
          mentees,
          activeCourses: courses || [],
          gradingQueue: pending.slice(0, 4).map(s => ({
            initials: (s.studentName || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
            name: s.title || s.assignmentTitle || "Untitled",
            by: s.studentName || "Unknown",
            time: "new"
          }))
        });
        setLoading(false);
      })
      .catch(() => { setLoading(false); })
  }, []);
  const { gradingQueue = [], mentees = [], activeCourses = [] } = dashboardData || {};

  if (loading) {
    return (
      <DashboardContainer>
        <MentorSidebar />
        <MainContent>
          <TopBar searchPlaceholder="Search mentees, courses, or tasks..." />
          <div style={{ textAlign: "center", paddingTop: 80, color: "#594048", fontSize: "1.1rem", fontWeight: 600 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            Loading your dashboard...
          </div>
        </MainContent>
      </DashboardContainer>
    );
  }
  return (
    <DashboardContainer>
      <MentorSidebar />
      <MainContent>
        <TopBar searchPlaceholder="Search mentees, courses, or tasks..." />

        <HeaderBar data-aos="fade-down">
          <div>
            <HeaderLabel>Mentor Central</HeaderLabel>
            <HeaderTitle>{greeting}, {mentorName}</HeaderTitle>
            <HeaderSub>You have {kpis.pendingTasks} submission{kpis.pendingTasks !== 1 ? "s" : ""} to grade and {kpis.totalMentees} active mentee{kpis.totalMentees !== 1 ? "s" : ""}.</HeaderSub>
          </div>
          <HeaderActions2>
            <OutlineBtn disabled={exporting} onClick={() => { setExporting(true); setActionMsg(null); setTimeout(() => { setExporting(false); setActionMsg("Report exported"); setTimeout(() => setActionMsg(null), 2000); }, 800); }}>{exporting ? "Exporting..." : "Export Report"}</OutlineBtn>
            <PrimaryBtn disabled={scheduling} onClick={() => { setScheduling(true); setActionMsg(null); setTimeout(() => { setScheduling(false); setActionMsg("Call scheduled! Check your calendar."); setTimeout(() => setActionMsg(null), 3000); }, 800); }}>{scheduling ? "Scheduling..." : "Schedule Call"}</PrimaryBtn>
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
                <MetricValue>{kpis.totalMentees}</MetricValue>
                <MetricTrend $positive>{kpis.totalMentees > 0 ? `${kpis.totalMentees} active` : "No mentees yet"}</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>⭐ Avg. Grade</MetricLabel>
                <MetricValue>{kpis.avgGrade}</MetricValue>
                <MetricTrend>{kpis.avgGrade !== "—" ? "From graded submissions" : "No grades yet"}</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>📝 Completion Rate</MetricLabel>
                <MetricValue>{kpis.completionRate}%</MetricValue>
                <MetricTrend $positive>{kpis.completionRate > 0 ? `${kpis.completionRate}% complete` : "No submissions"}</MetricTrend>
              </Metric>
              <Metric>
                <MetricLabel>⏰ Pending Tasks</MetricLabel>
                <MetricValue>{kpis.pendingTasks}</MetricValue>
                <MetricTrend>{kpis.pendingTasks > 0 ? "Needs attention" : "All caught up!"}</MetricTrend>
              </Metric>
            </MetricGrid>
            <TrendChart>
              {kpis.trendValues.length ? kpis.trendValues.map((v, i) => (
                <TrendBar key={i} $height={v} $active={i === new Date().getDay()} />
              )) : <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:16}}>No submission activity this week.</p>}
            </TrendChart>
          </GlassCard>

          <GlassCard data-aos="fade-up" data-aos-delay="100" style={{ display: "flex", flexDirection: "column" }}>
            <CardHeader>
              <CardTitle>Grading Queue</CardTitle>
              <NewCount>{kpis.pendingTasks} New</NewCount>
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
                        <StudentAvatar style={{background:m.role==="mentor"?"#b50064":"#0298D7"}}>{m.name ? m.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?"}</StudentAvatar>
                        <div>
                          <StudentName>{m.name}</StudentName>
                          <StudentEmail>{m.email}</StudentEmail>
                        </div>
                      </StudentInfo>
                    </Td>
                    <Td><PathBadge style={{background:"#0298D7"}}>{m.role || "Mentee"}</PathBadge></Td>
                    <Td>
                      <ProgressCell>
                        <ProgressBar2>
                          <ProgressFill2 $width={m.verified ? 100 : 0} />
                        </ProgressBar2>
                        <ProgressLabel $width={m.verified ? 100 : 0}>{m.verified ? "Verified" : "Pending"}</ProgressLabel>
                      </ProgressCell>
                    </Td>
                    <Td style={{ color: "#594048" }}>{m.city || "—"}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: m.verified ? "#27AE60" : "#594048" }}>
                        <StatusDot $online={!!m.verified} />
                        {m.verified ? "Active" : "Inactive"}
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
                    <StudentAvatar style={{background:m.role==="mentor"?"#b50064":"#0298D7"}}>{m.name ? m.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?"}</StudentAvatar>
                    <div>
                      <StudentName>{m.name}</StudentName>
                      <StudentEmail>{m.email}</StudentEmail>
                    </div>
                  </MenteeCardInfo>
                  <ChatBtn disabled={chattingId === m.name} onClick={() => { setChattingId(m.name); setActionMsg(null); setTimeout(() => { setChattingId(null); setActionMsg(`Chat with ${m.name} coming soon`); setTimeout(() => setActionMsg(null), 2000); }, 600); }}>{chattingId === m.name ? "..." : "💬"}</ChatBtn>
                </MenteeCardRow>
                <MenteeCardRow>
                  <PathBadge style={{background:"#0298D7"}}>{m.role || "Mentee"}</PathBadge>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: m.verified ? "#27AE60" : "#594048" }}>
                    <StatusDot $online={!!m.verified} />
                    {m.verified ? "Active" : "Inactive"}
                  </span>
                </MenteeCardRow>
                <MenteeCardRow>
                  <ProgressCell style={{ minWidth: 0, flex: 1, gap: 8 }}>
                    <ProgressBar2 style={{ flex: 1 }}>
                      <ProgressFill2 $width={m.verified ? 100 : 0} />
                    </ProgressBar2>
                    <ProgressLabel $width={m.verified ? 100 : 0}>{m.verified ? "Verified" : "Pending"}</ProgressLabel>
                  </ProgressCell>
                  <span style={{ fontSize: "0.75rem", color: "#594048" }}>{m.city || "—"}</span>
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
              <CourseCard key={i} onClick={() => navigate(`/dashboard/${role}/course/${encodeURIComponent(c.title)}`)} style={c.featuredImage ? {backgroundImage:`url(${c.featuredImage})`,backgroundSize:"cover",backgroundPosition:"center"} : {background:`linear-gradient(135deg, ${c.color || "#b50064"}, ${c.color2 || "#006590"})`}}>
                <CourseOverlay>
                  <CourseBadge2>{c.badge}</CourseBadge2>
                  <CourseTitle2>{c.emoji} {c.title}</CourseTitle2>
                  <CourseCount>{(c.enrolledMentees || c.enrolled || []).length || c.enrolled || 0} enrolled</CourseCount>
                </CourseOverlay>
              </CourseCard>
            ))}
            <AddCourseCard onClick={() => { setAddingProgram(true); setActionMsg(null); addCourse({ title: "New Program", instructor: mentorName }).then(() => { setAddingProgram(false); setActionMsg("Program created! Manage it in My Courses."); setTimeout(() => setActionMsg(null), 3000); }).catch(() => { setAddingProgram(false); setActionMsg("Failed to create program"); setTimeout(() => setActionMsg(null), 2000); }); }}>
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
