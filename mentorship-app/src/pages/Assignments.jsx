import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser } from "../firebase/auth";
import { fileToBase64 } from "../lib/upload";
import { getUser } from "../firebase/db";

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

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  width: fit-content;
  @media (max-width: 600px) { display: none; }
`;

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: ${(props) => props.$active ? props.theme.colors.primary : "transparent"};
  color: ${(props) => props.$active ? "white" : props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
`;

const AssignmentCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 16px;
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  @media (max-width: 600px) { flex-direction: column; }
`;

const IconBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${(props) => props.$color || props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const CardBody = styled.div`
  flex: 1;
`;

const CardTitle = styled.h4`
  font-weight: 700;
  font-size: 1.15rem;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const CardCourse = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: 16px;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  padding: 4px 12px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 8px;
`;

const MetaValue = styled.span`
  font-weight: 700;
  color: ${(props) =>
    props.$highlight ? props.theme.colors.primary : props.theme.colors.textPrimary};
  font-size: ${(props) => props.$large ? "1.1rem" : "0.85rem"};
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
  &:hover { color: ${(props) => props.theme.colors.primary}; border-color: ${(props) => props.theme.colors.primary}; }
`;

const CourseFilterTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 20px;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.primary}10;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 16px;
  margin-left: 12px;
`;

const ClearFilter = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary};
  font-size: 1rem;
  padding: 0 0 0 8px;
  line-height: 1;
`;

const StatusBadge = styled.span`
  padding: 4px 14px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) =>
    props.$status === "available" ? props.theme.colors.success + "20" :
    props.$status === "accepted" ? props.theme.colors.primary + "20" :
    props.$status === "graded" ? props.theme.colors.secondary + "20" :
    props.theme.colors.warning + "20"};
  color: ${(props) =>
    props.$status === "available" ? props.theme.colors.success :
    props.$status === "accepted" ? props.theme.colors.primary :
    props.$status === "graded" ? props.theme.colors.secondary :
    props.theme.colors.warning};
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid ${(props) => props.theme.colors.outline}50;
  @media (max-width: 600px) { flex-direction: column; gap: 12px; align-items: stretch; }
`;

const PostedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PosterAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) => props.$color || props.theme.colors.secondary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: ${(props) => props.$color || props.theme.colors.secondary};
`;

const PosterInfo = styled.div`
  p:first-child { font-weight: 600; font-size: 0.85rem; color: ${(props) => props.theme.colors.textPrimary}; }
  p:last-child { font-size: 0.75rem; color: ${(props) => props.theme.colors.textSecondary}; }
`;

const CreateToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background: ${(props) => props.$open ? props.theme.colors.primary : "transparent"};
  color: ${(props) => props.$open ? "white" : props.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
  &:hover { opacity: 0.9; }
`;

const CreateFormCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 28px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 6px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const MobileFilter = styled.select`
  display: none;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 24px;
  box-sizing: border-box;
  @media (max-width: 600px) { display: block; }
`;

const SubmitBtn = styled.button`
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const ViewSubmissionsBtn = styled.button`
  padding: 10px 24px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.primary}; color: white; }
`;

const AcceptBtn = styled.button`
  padding: 10px 28px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.$accepted ? props.theme.colors.outline : props.theme.colors.primary};
  color: ${(props) => props.$accepted ? props.theme.colors.textSecondary : "white"};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: ${(props) => props.$accepted ? "default" : "pointer"};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
`;

const GradeDisplay = styled.div`
  text-align: center;
`;

const GradeNumber = styled.p`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.primary};
  line-height: 1;
`;

const GradeLabel = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const Assignments = () => {
  const { role } = useParams();
  const isMentor = role === "mentor";
  const isMentee = role === "mentee";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");
  const [assignments, setAssignments] = useState([]);
  const [menteeMentorId, setMenteeMentorId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "", course: "Advanced UI/UX Systems", desc: "", marks: "", due: "",
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    if (isMentee && currentUser?.id) {
      getUser(currentUser.id).then(u => {
        if (u?.mentorId) setMenteeMentorId(u.mentorId);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const stored = localStorage.getItem("assignments");
    if (stored) setAssignments(JSON.parse(stored));
  }, []);

  const currentUser = getStoredUser();
  const mentorFiltered = (() => {
    if (isMentor && currentUser?.id) return assignments.filter(a => a.mentorId === currentUser.id);
    if (isMentee && menteeMentorId) return assignments.filter(a => a.mentorId === menteeMentorId);
    return assignments;
  })();

  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  }, [assignments]);

  const handleCreateAssignment = () => {
    const user = getStoredUser();
    const newId = Math.max(...assignments.map(a => a.id), 0) + 1;
    const assignment = {
      id: newId,
      title: newAssignment.title,
      course: newAssignment.course,
      desc: newAssignment.desc,
      marks: Number(newAssignment.marks),
      due: newAssignment.due,
      posted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "available",
      icon: "📋",
      iconColor: "#b50064",
      poster: "You",
      posterRole: "Mentor",
      mentorId: user?.id || null,
      submissions: 0,
      spots: 15,
    };
    setAssignments([assignment, ...assignments]);
    setNewAssignment({ title: "", course: "Advanced UI/UX Systems", desc: "", marks: "", due: "" });
    setShowCreateForm(false);
    alert("Assignment posted!");
  };

  const handleAccept = (id) => {
    const updated = assignments.map(a => {
      if (a.id === id) {
        localStorage.setItem("acceptedAssignments", JSON.stringify([
          ...JSON.parse(localStorage.getItem("acceptedAssignments") || "[]").filter(x => x.id !== id),
          { id: a.id, title: a.title, course: a.course },
        ]));
        return { ...a, status: "accepted" };
      }
      return a;
    });
    setAssignments(updated);
  };

  const courseFiltered = courseFilter
    ? mentorFiltered.filter(a => a.course === courseFilter)
    : mentorFiltered;

  const filtered = activeTab === "all"
    ? courseFiltered
    : courseFiltered.filter(a => a.status === activeTab);

  const clearCourseFilter = () => {
    setSearchParams({});
  };

  const tabs = ["all", "available", "accepted", "submitted", "graded"];

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search assignments..." />
        <PageTitle data-aos="fade-down">{isMentor ? "Manage Assignments" : "Task / Assignment"}</PageTitle>

        {isMentor && (
          <div>
            <CreateToggle $open={showCreateForm} onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "− Cancel" : "+ Create Assignment"}
            </CreateToggle>
            {showCreateForm && (
              <CreateFormCard>
                <FormGroup>
                  <FormLabel>Assignment Title</FormLabel>
                  <FormInput type="text" value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} placeholder="Enter assignment title" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Course</FormLabel>
                  <FormSelect value={newAssignment.course} onChange={(e) => setNewAssignment({...newAssignment, course: e.target.value})}>
                    <option>Advanced UI/UX Systems</option>
                    <option>Strategic Data Insights</option>
                    <option>Design Thinking Fundamentals</option>
                    <option>Full-Stack Web Development</option>
                    <option>Product Management 101</option>
                    <option>Creative Brand Strategy</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Description</FormLabel>
                  <FormTextarea value={newAssignment.desc} onChange={(e) => setNewAssignment({...newAssignment, desc: e.target.value})} placeholder="Enter assignment description" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Marks</FormLabel>
                  <FormInput type="number" value={newAssignment.marks} onChange={(e) => setNewAssignment({...newAssignment, marks: e.target.value})} placeholder="Enter maximum marks" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Due Date</FormLabel>
                  <FormInput type="date" value={newAssignment.due} onChange={(e) => setNewAssignment({...newAssignment, due: e.target.value})} />
                </FormGroup>
                <SubmitBtn onClick={handleCreateAssignment}>Post Assignment</SubmitBtn>
              </CreateFormCard>
            )}
          </div>
        )}

        {courseFilter && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <BackBtn onClick={() => { clearCourseFilter(); navigate(`/dashboard/${role}/my-courses`); }}>
              ← Back to Courses
            </BackBtn>
            <CourseFilterTag>
              📚 {courseFilter}
              <ClearFilter onClick={clearCourseFilter}>✕</ClearFilter>
            </CourseFilterTag>
          </div>
        )}

        {!isMentor && (
          <>
            <Tabs className="desktop-tabs">
              {tabs.map((t) => (
                <Tab key={t} $active={activeTab === t} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Tab>
              ))}
            </Tabs>
            <MobileFilter
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </MobileFilter>
          </>
        )}

        {filtered.map((a, i) => (
          <AssignmentCard key={a.id} data-aos="fade-up" data-aos-delay={i * 50}>
            <CardTop>
              <IconBox $color={a.iconColor}>{a.icon}</IconBox>
              <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <CardTitle>{a.title}</CardTitle>
                    <CardCourse>{a.course}</CardCourse>
                  </div>
                  {!isMentor && <StatusBadge $status={a.status}>{a.status}</StatusBadge>}
                </div>
                <Description>{a.desc}</Description>
                <MetaRow>
                  <MetaItem>📅 Due <MetaValue>{a.due}</MetaValue></MetaItem>
                  <MetaItem>🏆 Marks <MetaValue $highlight $large>{a.marks}</MetaValue></MetaItem>
                  <MetaItem>📤 Posted {a.posted}</MetaItem>
                  <MetaItem>👥 {a.submissions}/{a.spots} taken</MetaItem>
                </MetaRow>
              </CardBody>
            </CardTop>

            <CardFooter>
              <PostedBy>
                <PosterAvatar $color={a.iconColor}>{a.poster.split(" ").map(w => w[0]).join("")}</PosterAvatar>
                <PosterInfo>
                  <p>Posted by {a.poster}</p>
                  <p>{a.posterRole}</p>
                </PosterInfo>
              </PostedBy>

              {isMentor ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <MetaItem>👥 {a.submissions} submission{a.submissions !== 1 ? "s" : ""}</MetaItem>
                  <ViewSubmissionsBtn onClick={() => navigate(`/dashboard/${role}/submissions?course=${encodeURIComponent(a.course)}`)}>
                    View Submissions
                  </ViewSubmissionsBtn>
                </div>
              ) : (() => {
                if (a.status === "graded") return <GradeDisplay><GradeNumber>{a.grade}%</GradeNumber><GradeLabel>Grade</GradeLabel></GradeDisplay>;
                if (a.status === "submitted") return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: "0.8rem", color: "#006590", fontWeight: 600 }}>✅ Submitted</span></div>;
                if (a.status === "accepted") return <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AcceptBtn $accepted style={{ cursor: "default", opacity: 0.7 }}>✓ Accepted</AcceptBtn>
                  <AcceptBtn style={{ background: "#006590", color: "#fff", border: "none", fontSize: "0.78rem" }}
                    onClick={() => { const el = document.getElementById(`submit-${a.id}`); if (el) el.style.display = el.style.display === "none" ? "block" : "none"; }}>
                    📤 Submit
                  </AcceptBtn>
                </div>;
                return <AcceptBtn onClick={() => handleAccept(a.id)}>Accept Assignment</AcceptBtn>;
              })()}
            </CardFooter>
            {!isMentor && a.status === "accepted" && (
              <div id={`submit-${a.id}`} style={{ display: "none", padding: "16px 24px 20px", borderTop: "1px solid #e0e0e050", background: "#f9f9f9", borderRadius: "0 0 24px 24px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input type="file" id={`file-${a.id}`}
                    style={{ flex: 1, fontSize: "0.85rem", fontFamily: "inherit" }} />
                  <button onClick={async () => {
                    const f = document.getElementById(`file-${a.id}`).files?.[0];
                    if (!f) return alert("Please select a file");
                    const u = getStoredUser();
                    const subKey = `submissions_${u?.email || "default"}`;
                    const existing = JSON.parse(localStorage.getItem(subKey) || "[]");
                    let content = null;
                    if (f.size < 500000) content = await fileToBase64(f);
                    existing.push({ id: Date.now(), assignment: a.title, course: a.course, file: f.name, size: (f.size / 1024).toFixed(0) + " KB", date: new Date().toLocaleDateString(), status: "Pending", content });
                    localStorage.setItem(subKey, JSON.stringify(existing));
                    setAssignments(prev => prev.map(x => x.id === a.id ? { ...x, status: "submitted" } : x));
                    alert(`Submitted "${a.title}" successfully!`);
                  }}
                    style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#b50064", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    Upload & Submit
                  </button>
                </div>
              </div>
            )}
          </AssignmentCard>
        ))}
      </Main>
    </Page>
  );
};
