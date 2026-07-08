import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getUsers, getCourses, getAllGradebook, updateGradebook, getSubmissions, getMenteesByMentor } from "../firebase/db";

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  @media (min-width: ${props => props.theme.breakpoints.mobile}) and (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${props => props.theme.spacing.lg};
  }
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: ${props => props.theme.spacing.sm};
  }
`;

const PageTitle = styled.h2`
  font-size: ${props => props.theme.typography.heading2};
  font-family: ${props => props.theme.typography.fontFamilyHeading};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 8px;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const PageSub = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 32px;
  font-size: 0.95rem;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-bottom: 20px;
    font-size: 0.85rem;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  border: 1px solid ${props => props.theme.colors.outline};
  overflow: hidden;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    border-radius: 16px;
  }
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.outline}40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${props => props.theme.colors.outline}50;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 14px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.outline}20;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textPrimary};
  white-space: nowrap;
`;

const Tr = styled.tr`
  transition: all 0.15s;
  &:hover { background: ${props => props.theme.colors.background}; }
  &:last-child td { border-bottom: none; }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StudentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primaryContainer};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const ScoreCell = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.8rem;
  background: ${props =>
    props.$score >= 80 ? "#27AE6020" :
    props.$score >= 60 ? "#F39C1220" :
    "#E5393530"};
  color: ${props =>
    props.$score >= 80 ? "#27AE60" :
    props.$score >= 60 ? "#F39C12" :
    "#E53935"};
`;

const AvgBadge = styled.span`
  display: inline-block;
  padding: 4px 14px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  background: ${props =>
    props.$avg >= 80 ? "#27AE6020" :
    props.$avg >= 60 ? "#F39C1220" :
    "#E5393530"};
  color: ${props =>
    props.$avg >= 80 ? "#27AE60" :
    props.$avg >= 60 ? "#F39C12" :
    "#E53935"};
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.75rem;
  background: ${props => props.$pass ? "#27AE6015" : "#E5393515"};
  color: ${props => props.$pass ? "#27AE60" : "#E53935"};
`;

const GradeCards = styled.div`
  display: none;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const GradeCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.outline}30;
  border-radius: 16px;
  padding: 16px;
`;

const GradeCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const GradeCardScore = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.78rem;
  background: ${props =>
    props.$score >= 80 ? "#27AE6020" :
    props.$score >= 60 ? "#F39C1220" :
    "#E5393530"};
  color: ${props =>
    props.$score >= 80 ? "#27AE60" :
    props.$score >= 60 ? "#F39C12" :
    "#E53935"};
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: ${props => props.theme.breakpoints.laptop}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.outline}50;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
`;

const COLORS = ["#6C5CE7","#00B894","#0984E3","#E17055","#FDCB6E","#E84393"];

export const Gradebook = () => {
  const { role } = useParams();
  const [mentees, setMentees] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true, offset: 50 });
    const user = getStoredUser();
    const load = async () => {
      try {
        const [allGradebooks, users, courses] = await Promise.all([getAllGradebook(), getUsers(), getCourses()]);
        console.log("Gradebook loaded:", allGradebooks.length, "entries", role);
        let filteredGradebooks = allGradebooks;
        if (role === "mentor" && user?.id) {
          const mentees = await getMenteesByMentor(user.id).catch(() => []);
          const menteeIds = new Set(mentees.map(m => m.id));
          filteredGradebooks = allGradebooks.filter(gb => menteeIds.has(gb.menteeId));
        }
        const userMap = {};
        users.forEach(u => { userMap[u.id] = u; });
        const menteeMap = {};
        filteredGradebooks.forEach(gb => {
          const menteeId = gb.menteeId;
          if (!menteeMap[menteeId]) {
            const user = userMap[menteeId] || {};
            const name = user.name || "Unknown";
            const initials = name.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
            menteeMap[menteeId] = {
              name,
              initials,
              color: COLORS[menteeId.length % COLORS.length],
              scores: {},
              avg: 0
            };
          }
          if (gb.scores && typeof gb.scores === "object") {
            Object.keys(gb.scores).forEach(assignment => {
              menteeMap[menteeId].scores[assignment] = gb.scores[assignment];
            });
          }
        });
        const result = Object.values(menteeMap);
        result.forEach(m => {
          const vals = Object.values(m.scores).filter(v => typeof v === "number");
          m.avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        });
        setMentees(result);
      } catch (e) { console.error("getGradebook error:", e); }
    };
    load();
  }, [authReady]);

  const allAssignments = mentees.length > 0
    ? [...new Set(mentees.flatMap(m => Object.keys(m.scores)))]
    : [];

  const q = searchTerm.toLowerCase();
  const filteredMentees = mentees.filter(m => m.name?.toLowerCase().includes(q));

  const totalMentees = filteredMentees.length;
  const passing = filteredMentees.filter(m => m.avg >= 60).length;
  const avgGrade = Math.round(filteredMentees.reduce((s, m) => s + m.avg, 0) / (filteredMentees.length || 1));
  const failing = filteredMentees.filter(m => m.avg < 60).length;

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search gradebook..." onSearch={setSearchTerm} />
        <PageTitle data-aos="fade-down">Gradebook</PageTitle>
        <PageSub data-aos="fade-down">View and track mentee performance across all assignments.</PageSub>

        <MetricGrid data-aos="fade-up">
          <Metric><MetricLabel>👥 Total Mentees</MetricLabel><MetricValue>{totalMentees}</MetricValue></Metric>
          <Metric><MetricLabel>📊 Average Grade</MetricLabel><MetricValue>{avgGrade}%</MetricValue></Metric>
          <Metric><MetricLabel>✅ Passing (≥60%)</MetricLabel><MetricValue style={{ color: "#27AE60" }}>{passing}</MetricValue></Metric>
          <Metric><MetricLabel>❌ Failing (&lt;60%)</MetricLabel><MetricValue style={{ color: failing > 0 ? "#E53935" : "#27AE60" }}>{failing}</MetricValue></Metric>
        </MetricGrid>

        <Card data-aos="fade-up">
          <CardHeader>
            <CardTitle>Mentee Scores</CardTitle>
          </CardHeader>
          <style>{`@media(max-width:480px){.gradebook-table-wrap{display:none}}`}</style>
          <GradeCards>
            {mentees.map((m, i) => (
              <GradeCard key={i}>
                <GradeCardRow style={{ marginBottom: 12 }}>
                  <StudentInfo>
                    <StudentAvatar $color={m.color}>{m.initials}</StudentAvatar>
                    <span style={{ fontWeight: 700 }}>{m.name}</span>
                  </StudentInfo>
                  <GradeCardRow style={{ gap: 8 }}>
                    <AvgBadge $avg={m.avg} style={{ fontSize: "0.8rem", padding: "4px 10px" }}>{m.avg}%</AvgBadge>
                    <StatusTag $pass={m.avg >= 60} style={{ fontSize: "0.7rem", padding: "3px 8px" }}>{m.avg >= 60 ? "✅" : "❌"}</StatusTag>
                  </GradeCardRow>
                </GradeCardRow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {allAssignments.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}>
                      <span style={{ color: "#594048" }}>{a}:</span>
                      {m.scores[a] !== undefined ? (
                        <GradeCardScore $score={m.scores[a]}>{m.scores[a]}</GradeCardScore>
                      ) : <span style={{ color: "#594048", opacity: 0.4 }}>—</span>}
                    </div>
                  ))}
                </div>
              </GradeCard>
            ))}
          </GradeCards>
          <div className="gradebook-table-wrap" style={{ overflowX: "auto" }}>
            <Table className="gradebook-table">
              <thead>
                <tr>
                  <Th>Mentee</Th>
                  {allAssignments.map(a => <Th key={a}>{a}</Th>)}
                  <Th>Average</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
            {filteredMentees.length === 0 && searchTerm ? <p style={{gridColumn:"1/-1",color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:48}}>No mentees match "{searchTerm}".</p> : filteredMentees.map((m, i) => (
                  <Tr key={i}>
                    <Td>
                      <StudentInfo>
                        <StudentAvatar $color={m.color}>{m.initials}</StudentAvatar>
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                      </StudentInfo>
                    </Td>
                    {allAssignments.map(a => (
                      <Td key={a}>
                        {m.scores[a] !== undefined ? (
                          <ScoreCell $score={m.scores[a]}>{m.scores[a]}</ScoreCell>
                        ) : <span style={{ color: "#594048", opacity: 0.4 }}>—</span>}
                      </Td>
                    ))}
                    <Td><AvgBadge $avg={m.avg}>{m.avg}%</AvgBadge></Td>
                    <Td><StatusTag $pass={m.avg >= 60}>{m.avg >= 60 ? "✅ Passing" : "❌ Failing"}</StatusTag></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </Main>
    </Page>
  );
};
