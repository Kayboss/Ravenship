import React, { useEffect } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { AdminSidebar } from "../components/layout/AdminSidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { useParams, useNavigate } from "react-router-dom";

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.xl};
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${(props) => props.theme.spacing.lg};
  }
`;

const PageTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.heading2};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
`;

const MetricLabel = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const MetricValue = styled.p`
  font-size: 2rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1;
`;

const MetricChange = styled.p`
  font-size: 0.8rem;
  margin-top: 8px;
  color: ${(props) => props.$up ? props.theme.colors.success : props.theme.colors.error};
`;

const ChartSection = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h4`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 0 8px;
`;

const ChartBarWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ChartBar = styled.div`
  width: 100%;
  max-width: 48px;
  height: ${(props) => props.$h}%;
  background: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.primary}30;
  border-radius: 8px 8px 4px 4px;
  transition: height 0.6s ease;
  min-height: 4px;
`;

const ChartLabel = styled.span`
  font-size: 0.7rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const SubjectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}40;
  &:last-child { border-bottom: none; }
`;

const SubjectInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubjectBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${(props) => props.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const SubjectName = styled.p`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const SubjectGrade = styled.p`
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

const CourseTable = styled.div`
  width: 100%;
`;

const CourseTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 0;
  border-bottom: 2px solid ${(p) => p.theme.colors.outline};
  font-size: 0.75rem;
  color: ${(p) => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CourseTableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.outline}40;
  align-items: center;
  &:last-child { border-bottom: none; }
`;

const CourseCell = styled.div`
  font-size: 0.85rem;
  color: ${(p) => p.theme.colors.textPrimary};
  font-weight: ${(p) => p.$bold ? 600 : 400};
`;

const SubmissionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.outline}40;
  &:last-child { border-bottom: none; }
`;

const SubmissionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubmissionMeta = styled.div`
  font-size: 0.75rem;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-top: 2px;
`;

const GradeButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${(p) => p.theme.colors.primary};
  color: #fff;
  font-weight: 600;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const charts = [
  { label: "Mon", h: 45, active: false },
  { label: "Tue", h: 60, active: false },
  { label: "Wed", h: 35, active: false },
  { label: "Thu", h: 80, active: true },
  { label: "Fri", h: 55, active: false },
  { label: "Sat", h: 70, active: false },
  { label: "Sun", h: 40, active: false },
];

const subjects = [
  { name: "Advanced UI/UX Systems", emoji: "🎨", color: "#b50064", grade: "92%" },
  { name: "Design Thinking Fundamentals", emoji: "💡", color: "#ffd200", grade: "88%" },
  { name: "Full-Stack Web Development", emoji: "⚛️", color: "#006590", grade: "85%" },
  { name: "Strategic Data Insights", emoji: "📊", color: "#b50064", grade: "78%" },
  { name: "Product Management 101", emoji: "🚀", color: "#ffd200", grade: "91%" },
];

export const Analytics = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const isMentor = role === "mentor";
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <Page>
      <AdminSidebar />
      <Main>
        <TopBar searchPlaceholder="Search analytics..." />
        <PageTitle data-aos="fade-down">{isMentor ? "Mentor Analytics" : "Analytics"}</PageTitle>
        {isMentor ? (
          <>
            <MetricGrid>
              <MetricCard data-aos="fade-up" data-aos-delay="0">
                <MetricLabel>👥 Total Mentees</MetricLabel>
                <MetricValue>128</MetricValue>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="50">
                <MetricLabel>📝 Pending Submissions</MetricLabel>
                <MetricValue>12</MetricValue>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="100">
                <MetricLabel>⭐ Avg Mentee Grade</MetricLabel>
                <MetricValue>86.8%</MetricValue>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="150">
                <MetricLabel>📊 Active Courses</MetricLabel>
                <MetricValue>6</MetricValue>
              </MetricCard>
            </MetricGrid>
            <ChartSection data-aos="fade-up">
              <ChartHeader>
                <ChartTitle>📊 Grade Distribution</ChartTitle>
                <span style={{ fontSize: "0.8rem", color: "#594048" }}>Across all mentees</span>
              </ChartHeader>
              <ChartBars>
                {[
                  { label: "A (90-100)", h: 75, active: true },
                  { label: "B (80-89)", h: 90, active: false },
                  { label: "C (70-79)", h: 55, active: false },
                  { label: "D (60-69)", h: 30, active: false },
                  { label: "F (0-59)", h: 15, active: false },
                ].map((c, i) => (
                  <ChartBarWrap key={i}>
                    <ChartBar $h={c.h} $active={c.active} />
                    <ChartLabel>{c.label}</ChartLabel>
                  </ChartBarWrap>
                ))}
              </ChartBars>
            </ChartSection>
            <BottomGrid>
              <ChartSection data-aos="fade-up" style={{ marginBottom: 0 }}>
                <ChartHeader>
                  <ChartTitle>📚 Course Performance</ChartTitle>
                </ChartHeader>
                <CourseTable>
                  <CourseTableHeader>
                    <span>Course</span>
                    <span>Enrolled</span>
                    <span>Avg Grade</span>
                    <span>Completion</span>
                  </CourseTableHeader>
                  {[
                    { name: "Advanced UI/UX Systems", enrolled: 45, grade: "91%", completion: "72%" },
                    { name: "Design Thinking Fundamentals", enrolled: 38, grade: "88%", completion: "92%" },
                    { name: "Full-Stack Web Development", enrolled: 32, grade: "85%", completion: "60%" },
                    { name: "Strategic Data Insights", enrolled: 28, grade: "78%", completion: "40%" },
                    { name: "Product Management 101", enrolled: 22, grade: "91%", completion: "15%" },
                    { name: "Creative Brand Strategy", enrolled: 18, grade: "87%", completion: "55%" },
                  ].map((c, i) => (
                    <CourseTableRow key={i}>
                      <CourseCell $bold>{c.name}</CourseCell>
                      <CourseCell>{c.enrolled}</CourseCell>
                      <CourseCell>{c.grade}</CourseCell>
                      <CourseCell>{c.completion}</CourseCell>
                    </CourseTableRow>
                  ))}
                </CourseTable>
              </ChartSection>
              <ChartSection data-aos="fade-up" style={{ marginBottom: 0 }}>
                <ChartHeader>
                  <ChartTitle>📋 Submissions Queue</ChartTitle>
                </ChartHeader>
                {[
                  { name: "UX Case Study", initials: "JD", course: "Advanced UI/UX Systems", time: "2h ago" },
                  { name: "Brand Strategy", initials: "AS", course: "Creative Brand Strategy", time: "5h ago" },
                  { name: "Python Final", initials: "ML", course: "Full-Stack Web Dev", time: "1d ago" },
                  { name: "Research Paper", initials: "KR", course: "Design Thinking", time: "1d ago" },
                  { name: "Data Dashboard", initials: "BT", course: "Strategic Data Insights", time: "2d ago" },
                ].map((s, i) => (
                  <SubmissionRow key={i}>
                    <SubmissionInfo>
                      <SubjectBadge $color={["#b50064","#006590","#ffd200","#b50064","#006590"][i]} style={{ fontSize: "0.8rem" }}>
                        {s.initials}
                      </SubjectBadge>
                      <div>
                        <SubjectName>{s.name}</SubjectName>
                        <SubmissionMeta>{s.course} · {s.time}</SubmissionMeta>
                      </div>
                    </SubmissionInfo>
                    <GradeButton onClick={() => navigate(`/dashboard/${role}/submissions`)}>Grade</GradeButton>
                  </SubmissionRow>
                ))}
              </ChartSection>
            </BottomGrid>
          </>
        ) : (
          <>
            <MetricGrid>
              <MetricCard data-aos="fade-up" data-aos-delay="0">
                <MetricLabel>Average Grade</MetricLabel>
                <MetricValue>86.8%</MetricValue>
                <MetricChange $up>↑ 4.2% from last month</MetricChange>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="50">
                <MetricLabel>Courses Completed</MetricLabel>
                <MetricValue>3/6</MetricValue>
                <MetricChange $up>↑ 50% completion rate</MetricChange>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="100">
                <MetricLabel>Hours Spent Learning</MetricLabel>
                <MetricValue>42h</MetricValue>
                <MetricChange $up>↑ 8h vs last week</MetricChange>
              </MetricCard>
              <MetricCard data-aos="fade-up" data-aos-delay="150">
                <MetricLabel>Tasks Completed</MetricLabel>
                <MetricValue>18</MetricValue>
                <MetricChange $up>↑ 6 this week</MetricChange>
              </MetricCard>
            </MetricGrid>
            <ChartSection data-aos="fade-up">
              <ChartHeader>
                <ChartTitle>📈 Weekly Activity</ChartTitle>
                <span style={{ fontSize: "0.8rem", color: "#594048" }}>Hours spent learning</span>
              </ChartHeader>
              <ChartBars>
                {charts.map((c, i) => (
                  <ChartBarWrap key={i}>
                    <ChartBar $h={c.h} $active={c.active} />
                    <ChartLabel>{c.label}</ChartLabel>
                  </ChartBarWrap>
                ))}
              </ChartBars>
            </ChartSection>
            <BottomGrid>
              <ChartSection data-aos="fade-up" style={{ marginBottom: 0 }}>
                <ChartHeader>
                  <ChartTitle>🏆 Subject Breakdown</ChartTitle>
                </ChartHeader>
                {subjects.map((s, i) => (
                  <SubjectRow key={i}>
                    <SubjectInfo>
                      <SubjectBadge $color={s.color}>{s.emoji}</SubjectBadge>
                      <SubjectName>{s.name}</SubjectName>
                    </SubjectInfo>
                    <SubjectGrade>{s.grade}</SubjectGrade>
                  </SubjectRow>
                ))}
              </ChartSection>
              <ChartSection data-aos="fade-up" style={{ marginBottom: 0 }}>
                <ChartHeader>
                  <ChartTitle>📋 Recent Feedback</ChartTitle>
                </ChartHeader>
                {[
                  { from: "Marcus Chen", text: "Great attention to detail in the component library audit." },
                  { from: "Dr. Sarah Jenkins", text: "Your synthesis shows strong analytical thinking." },
                  { from: "Aisha Patel", text: "Excellent data visualization — clear and insightful." },
                ].map((f, i) => (
                  <SubjectRow key={i} style={{ alignItems: "flex-start" }}>
                    <SubjectInfo>
                      <SubjectBadge $color={["#b50064","#006590","#ffd200"][i]} style={{ fontSize: "0.8rem" }}>
                        {f.from.split(" ").map(w => w[0]).join("")}
                      </SubjectBadge>
                      <div>
                        <SubjectName>{f.from}</SubjectName>
                        <p style={{ fontSize: "0.8rem", color: "#594048", marginTop: 2 }}>{f.text}</p>
                      </div>
                    </SubjectInfo>
                  </SubjectRow>
                ))}
              </ChartSection>
            </BottomGrid>
          </>
        )}
      </Main>
    </Page>
  );
};
