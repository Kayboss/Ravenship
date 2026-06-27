import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { MenteeSidebar } from "../components/layout/MenteeSidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getCourses, getSubmissions, updateSubmission, getGradebook, getUser, getEnrollments } from "../firebase/db";

const truncateWords = (text, max = 25) => text?.split(" ").slice(0, max).join(" ") + (text?.split(" ").length > max ? "..." : "");

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
    padding: ${(props) => props.theme.spacing.lg};
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary} 0%, ${(props) => props.theme.colors.secondary} 100%);
  border-radius: 24px;
  padding: 48px;
  color: white;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  position: relative;
  overflow: hidden;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    padding: 32px 24px;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.heading1};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  font-weight: 800;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const HeroText = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  line-height: 1.6;
`;

const HeroStats = styled.div`
  display: flex;
  gap: 24px;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatValue = styled.p`
  font-size: ${(props) => props.theme.typography.heading2};
  font-weight: 700;
`;

const StatLabel = styled.p`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.heading3};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
`;

const ViewAllBtn = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.secondary};
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const CourseImage = styled.div`
  height: 120px;
  border-radius: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary}20, ${(props) => props.theme.colors.secondary}20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const CourseBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const CourseTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const CourseDesc = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
  line-height: 1.5;
`;

const ProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 8px;
`;

const ProgressPercent = styled.span`
  color: ${(props) => props.theme.colors.secondary};
  font-weight: 600;
`;

const ProgressNext = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 50px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: ${(props) => props.theme.colors.primaryContainer};
  border-radius: 50px;
  transition: width 0.8s ease;
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: 1fr;
  }
`;

const TaskCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
`;

const AssignItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  transition: all 0.2s;
  margin-bottom: 8px;
  border: 1px solid transparent;

  &:hover {
    border-color: ${(props) => props.theme.colors.outline};
  }
`;

const AssignIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${(props) => props.$color || props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const AssignBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const AssignTitle = styled.p`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const AssignCourse = styled.p`
  font-size: 0.78rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const AssignMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: ${(props) => props.$urgent ? props.theme.colors.error : props.theme.colors.textSecondary};
`;

const MarksPill = styled.span`
  padding: 2px 8px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.primary}10;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 700;
  font-size: 0.7rem;
`;

const AcceptSmallBtn = styled.button`
  padding: 6px 16px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  &:hover { opacity: 0.9; }
`;

const ViewAllSmall = styled.button`
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 12px;
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${(props) => props.theme.colors.primary}; color: ${(props) => props.theme.colors.primary}; }
`;

const GradesCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const GradeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline};
`;

const GradeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const GradeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.primary};
`;

const GradeDetails = styled.div``;

const GradeName = styled.p`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const GradeSub = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 2px;
`;

const GradeScore = styled.div`
  text-align: right;
`;

const ScoreValue = styled.p`
  font-size: ${(props) => props.theme.typography.heading3};
  font-weight: 700;
  color: ${(props) => props.theme.colors.success};
`;

const ScoreBadge = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.success}15;
  color: ${(props) => props.theme.colors.success};
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 4px;
`;

const FeedbackBanner = styled.div`
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const MentorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.colors.primary};
  background: ${(props) => props.theme.colors.primaryContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const FeedbackText = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-style: italic;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const QuickStatCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid ${(props) => props.theme.colors.outline};
`;

const StatLabel2 = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Badge = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) => props.$color || props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  cursor: help;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const ActivityChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
  gap: 8px;
`;

const Bar = styled.div`
  flex: 1;
  background: ${(props) => (props.$active ? props.theme.colors.primaryContainer : props.theme.colors.surface)};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 8px 8px 0 0;
  height: ${(props) => props.$height}%;
  transition: all 0.3s;
  position: relative;

  &:hover {
    background: ${(props) => props.theme.colors.primaryContainer};
  }
`;

const BarTooltip = styled.span`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;

  ${Bar}:hover & {
    opacity: 1;
  }
`;

const DayLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 700;
  margin-top: 8px;
`;

const courseMeta = {
  "Advanced UI/UX Systems": { desc: "Mastering the art of scalable design systems and component-driven architecture.", next: "Micro-interactions", badge: "Design", emoji: "🎨" },
  "Strategic Data Insights": { desc: "Translating complex datasets into actionable business strategies and narratives.", next: "Predictive Modeling", badge: "Business", emoji: "📊" },
  "Design Thinking Fundamentals": { desc: "Learning human-centered design processes and ideation techniques.", next: "Rapid Prototyping", badge: "Design", emoji: "💡" },
  "Full-Stack Web Development": { desc: "Building modern web applications with React, Node, and cloud services.", next: "API Design", badge: "Engineering", emoji: "⚛️" },
  "Product Management 101": { desc: "Mastering the product lifecycle from ideation to launch.", next: "Sprint Planning", badge: "Business", emoji: "🚀" },
  "Creative Brand Strategy": { desc: "Developing compelling brand identities and marketing narratives.", next: "Visual Identity", badge: "Design", emoji: "✨" },
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekHours = [40, 80, 60, 100, 50, 30, 20];

export const MenteeDashboard = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const { enrolledCourses } = useCourses();
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptMsg, setAcceptMsg] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [dashError, setDashError] = useState(null);
  const [dueAssignments, setDueAssignments] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [menteeName, setMenteeName] = useState("Mentee");
  const [groupName, setGroupName] = useState("");
  const [menteeStats, setMenteeStats] = useState({ hours: "0h", skills: "0", submissionsCount: 0, weekData: [0,0,0,0,0,0,0] });
  const [authReady, setAuthReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [directEnrollments, setDirectEnrollments] = useState({});
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);
  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true, offset: 50 });
    const user = getStoredUser();
    if (user?.name) setMenteeName(user.name.split(' ')[0]);
    const menteeId = user?.id;
    (async () => {
      let mentorFilter = null;
      if (menteeId) {
        const u = await getUser(menteeId);
        if (u?.mentorId) {
          mentorFilter = u.mentorId;
          getUser(u.mentorId).then(m => { if (m?.groupName) setGroupName(m.groupName); }).catch(e => console.error("getUser/groupName error:", e));
        }
      }
      const [coursesData, submissions, gradebook] = await Promise.all([
        getCourses(mentorFilter),
        menteeId ? getSubmissions({ menteeId }) : Promise.resolve([]),
        menteeId ? getGradebook(menteeId) : Promise.resolve([]),
      ]);
      setDashData({ courses: coursesData, submissions });
      setCoursesList(Array.isArray(coursesData) ? coursesData : []);
      const pending = (submissions || []).filter(s => s.status === "pending" || s.status === "assigned").map(s => ({
        id: s.id,
        title: s.title || s.name || "Assignment",
        course: s.courseName || s.course || "",
        due: s.dueDate || s.due || "TBD",
        marks: s.marks || s.totalMarks || 100,
        urgent: s.urgent || false,
        icon: s.icon || "📝",
        color: s.color || "#006590",
      }));
      if (pending.length > 0) setDueAssignments(pending);
      const graded = (submissions || []).filter(s => s.score != null);
      const allScores = gradebook.flatMap(g => Object.values(g.scores || {}).filter(v => typeof v === 'number'));
      const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
      const hours = submissions ? Math.round(submissions.length * 1.5 * 10) / 10 : 0;
      setMenteeStats({ hours: `${hours}h`, skills: `${graded.length || allScores.length}`, submissionsCount: submissions?.length || 0, weekData: [0,0,0,0,0,0,0] });
      // Load enrollments directly from Firestore
      if (menteeId) {
        const enrollments = await getEnrollments(menteeId).catch(() => ({}));
        setDirectEnrollments(enrollments);
      }
    })();
  }, [authReady]);

  const enrolledData = Object.keys(directEnrollments).length > 0 ? directEnrollments : enrolledCourses;
  const enrolledList = Object.entries(enrolledData).flatMap(([title, data]) => {
    const course = coursesList.find(c => c.title === title);
    if (!course) return [];
    return [{ title, desc: course.desc || "", next: "", badge: course.badge || "", emoji: course.emoji || "📚", progress: data.progress || 0 }];
  });

  const q = searchTerm.toLowerCase();
  const filteredEnrolled = enrolledList.filter(c => c.title?.toLowerCase().includes(q) || c.badge?.toLowerCase().includes(q));

  return (
    <DashboardContainer>
      <MenteeSidebar />
      <MainContent>
        <TopBar searchPlaceholder="Search courses, mentors..." onSearch={setSearchTerm} />

        <HeroSection data-aos="fade-down">
          <HeroTitle>Welcome back, {menteeName}! 👋</HeroTitle>
          {groupName && <HeroText style={{fontWeight:600,fontSize:"0.9rem",marginTop:-8}}>📍 Group: {groupName}</HeroText>}
          <HeroText>
            You have {dueAssignments.length} pending assignment{dueAssignments.length !== 1 ? "s" : ""} and {menteeStats.skills} completed submission{menteeStats.skills !== "1" ? "s" : ""}. Keep up the momentum!
          </HeroText>
          <HeroStats>
            <StatCard>
              <StatIcon>⏱️</StatIcon>
              <div>
                <StatValue>{menteeStats.hours}</StatValue>
                <StatLabel>Est. Hours</StatLabel>
              </div>
            </StatCard>
            <StatCard>
              <StatIcon>⭐</StatIcon>
              <div>
                <StatValue>{menteeStats.skills}</StatValue>
                <StatLabel>Completed</StatLabel>
              </div>
            </StatCard>
          </HeroStats>
        </HeroSection>

        <SectionHeader data-aos="fade-up">
          <SectionTitle>My Active Courses</SectionTitle>
          <ViewAllBtn onClick={() => navigate(`/dashboard/${role}/my-courses`)}>View All</ViewAllBtn>
        </SectionHeader>

        <CoursesGrid>
          {filteredEnrolled.length === 0 && !searchTerm ? (
            <CourseCard style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48 }}>
              <p style={{ fontSize: "3rem", marginBottom: 12 }}>📚</p>
              <p style={{ color: "#594048", fontWeight: 600 }}>No active courses yet.</p>
              <p style={{ fontSize: "0.85rem", color: "#594048", marginTop: 4 }}>Go to My Courses and start one!</p>
            </CourseCard>
          ) : filteredEnrolled.length === 0 && searchTerm ? <p style={{gridColumn:"1/-1",color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:48}}>No courses match "{searchTerm}".</p> : filteredEnrolled.map((course, i) => (
            <CourseCard key={i} data-aos="fade-up" data-aos-delay={i * 100} onClick={() => navigate(`/dashboard/mentee/course/${encodeURIComponent(course.title)}`)} style={{ cursor: "pointer" }}>
              <CourseImage>{course.emoji}</CourseImage>
              <CourseBadge>{course.badge}</CourseBadge>
              <CourseTitle>{course.title}</CourseTitle>
              <CourseDesc>{truncateWords(course.desc)}</CourseDesc>
              <ProgressRow>
                <ProgressPercent>{course.progress}% Complete</ProgressPercent>
                <ProgressNext>Next: {course.next}</ProgressNext>
              </ProgressRow>
              <ProgressBar>
                <ProgressFill $width={course.progress} />
              </ProgressBar>
            </CourseCard>
          ))}
        </CoursesGrid>

        <BentoGrid>
          <div data-aos="fade-up">
            <SectionHeader>
              <SectionTitle>Upcoming Task / Assignment</SectionTitle>
            </SectionHeader>
            <TaskCard>
              {dueAssignments.map((a, i) => (
                <AssignItem key={a.id}>
                  <AssignIcon $color={a.color}>{a.icon}</AssignIcon>
                  <AssignBody>
                    <AssignTitle>{a.title}</AssignTitle>
                    <AssignCourse>{a.course}</AssignCourse>
                    <AssignMeta $urgent={a.urgent}>
                      <span>📅 {a.due}</span>
                      <MarksPill>{a.marks} marks</MarksPill>
                    </AssignMeta>
                  </AssignBody>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <AcceptSmallBtn disabled={acceptingId === a.id} onClick={() => {
                      setAcceptingId(a.id); setAcceptMsg(null);
                      updateSubmission(a.id, { status: "accepted" })
                        .then(() => { setAcceptingId(null); setAcceptMsg(a.id); setTimeout(() => setAcceptMsg(null), 2000); })
                        .catch(() => { setAcceptingId(null); setAcceptMsg(null); });
                    }}>{acceptingId === a.id ? "Accepting..." : "Accept"}</AcceptSmallBtn>
                    {acceptMsg === a.id && <span style={{fontSize:"0.72rem",color:"#2e7d32",fontWeight:600}}>✅ Accepted</span>}
                  </div>
                </AssignItem>
              ))}
              <ViewAllSmall onClick={() => navigate(`/dashboard/${role}/assignments`)}>View All Assignments →</ViewAllSmall>
            </TaskCard>
          </div>

          <div data-aos="fade-up" data-aos-delay="100">
            <SectionHeader>
              <SectionTitle>Quick Stats</SectionTitle>
            </SectionHeader>
            <QuickStatCard>
              <StatLabel2>Milestone Badges</StatLabel2>
              <BadgeRow>
                <Badge $color="#ffe07c">🏆</Badge>
                <Badge $color="#c8e6ff">⚡</Badge>
                <Badge $color="#ffd9e3">👥</Badge>
              </BadgeRow>
              <div style={{ marginTop: 32 }}>
                <StatLabel2>Weekly Activity</StatLabel2>
                <ActivityChart>
                  {menteeStats.weekData.length ? menteeStats.weekData.map((h, i) => (
                    <Bar key={i} $height={h} $active={i === 3}>
                      <BarTooltip>{h || "0"} submissions</BarTooltip>
                    </Bar>
                  )) : <p style={{color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:16,gridColumn:"1/-1"}}>No activity yet this week.</p>}
                </ActivityChart>
                <DayLabels>
                  {weekDays.map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </DayLabels>
              </div>
            </QuickStatCard>
          </div>
        </BentoGrid>

        <div data-aos="fade-up">
          <SectionHeader>
            <SectionTitle>Recent Grades & Feedback</SectionTitle>
          </SectionHeader>
          <GradesCard>
            <p style={{ textAlign: "center", color: "#594048", padding: 32, fontSize: "0.9rem" }}>No grades yet. Complete assignments to see feedback here.</p>
          </GradesCard>
        </div>
      </MainContent>
    </DashboardContainer>
  );
};
