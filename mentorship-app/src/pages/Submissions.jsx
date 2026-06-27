import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getSubmissions, addSubmission, updateSubmission, getAssignments, getCourses } from "../firebase/db";

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

const UploadCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 32px;
  border: 2px dashed ${(props) => props.$drag ? props.theme.colors.primary : props.theme.colors.outline};
  transition: all 0.3s;
`;

const UploadTitle = styled.h3`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const FileZone = styled.div`
  border: 2px dashed ${(props) => props.$drag ? props.theme.colors.primary : props.theme.colors.outline};
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${(props) => props.$drag ? props.theme.colors.primary + "08" : props.theme.colors.background};
  margin-bottom: 20px;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background: ${(props) => props.theme.colors.primary + "08"};
  }
`;

const FileIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`;

const FileText = styled.p`
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const FileSubtext = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const SubmitBtn = styled.button`
  padding: 14px 32px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;

  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ListTitle = styled.h3`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const SubmissionCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; }
`;

const SubIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props) => props.$color || props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const SubInfo = styled.div`
  flex: 1;
`;

const SubTitle = styled.h4`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const SubMeta = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const SubStatus = styled.span`
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.$status === "reviewed" ? props.theme.colors.success + "20" : props.theme.colors.warning + "20"};
  color: ${(props) => props.$status === "reviewed" ? props.theme.colors.success : props.theme.colors.warning};
`;

const SubActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.background}; color: ${(props) => props.theme.colors.primary}; }
`;

const PreviewOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center;
`;

const PreviewCard = styled.div`
  background: ${(props) => props.theme.colors.surface}; border-radius: 20px; padding: 32px; width: 420px; max-width: 90vw;
`;

const PreviewTitle = styled.h3`
  font-weight: 700; color: ${(props) => props.theme.colors.textPrimary}; margin-bottom: 16px;
`;

const PreviewDetail = styled.p`
  font-size: 0.85rem; color: ${(props) => props.theme.colors.textPrimary}; margin-bottom: 6px;
  span { color: ${(props) => props.theme.colors.textSecondary}; }
`;

const PreviewClose = styled.button`
  margin-top: 20px; padding: 10px 24px; border-radius: 12px; border: none;
  background: ${(props) => props.theme.colors.primary}; color: #fff;
  font-family: inherit; font-weight: 600; cursor: pointer;
`;

export const Submissions = () => {
  const { role } = useParams();
  const isMentor = role === "mentor";
  const isMentee = role === "mentee";
  const { enrolledCourses } = useCourses();
  const [submissions, setSubmissions] = useState([]);
  const [acceptedAssignments, setAcceptedAssignments] = useState([]);
  const [drag, setDrag] = useState(false);
  const [form, setForm] = useState({ title: "", course: "" });
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [gradeTarget, setGradeTarget] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [grading, setGrading] = useState(false);

  const handleGrade = (sub) => {
    setGradeTarget(sub);
    setGradeScore("");
    setGradeFeedback("");
  };

  const submitGrade = async () => {
    const score = parseInt(gradeScore);
    if (isNaN(score) || score < 0 || score > 100) return alert("Enter a grade between 0 and 100");
    setGrading(true);
    const subId = gradeTarget.id || gradeTarget.firestoreId;
    const orig = gradeTarget;
    try {
      if (orig.firestoreId || orig.id) {
        await updateSubmission(orig.firestoreId || orig.id, { status: "reviewed", grade: score, feedback: gradeFeedback });
      }
    } catch (e) { console.error("updateSubmission error:", e); }
    setSubmissions(prev => prev.map(s =>
      (s.id === subId || s.firestoreId === subId) ? { ...s, status: "reviewed", grade: score, feedback: gradeFeedback } : s
    ));
    setGradeTarget(null);
    setGrading(false);
  };

  const activeCourses = useMemo(() =>
    Object.entries(enrolledCourses).filter(([, v]) => v.progress > 0).map(([k]) => k),
    [enrolledCourses]
  );

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true });
    const currentUser = getStoredUser();
    if (!currentUser?.id) return;

    getAssignments().then(d => {
      const acc = (Array.isArray(d) ? d : []).filter(a => a.status === "accepted" || a.status === "submitted");
      setAcceptedAssignments(acc);
    }).catch(e => console.error("getAssignments error:", e));

    const filter = isMentee ? { menteeId: currentUser.id } : {};
    getSubmissions(filter).then(d => { if (Array.isArray(d)) setSubmissions(d); }).catch(e => console.error("getSubmissions error:", e));
  }, [authReady]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleAssignmentSelect = (value) => {
    const found = acceptedAssignments.find(a => a.title === value);
    setForm({ title: value, course: found?.course || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !fileName) return;
    setSubmitting(true);
    const currentUser = getStoredUser();
    const newSub = {
      title: form.title,
      course: form.course || "General",
      file: fileName,
      size: "~1.2 MB",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      color: "#b50064",
      icon: "📄",
      menteeId: currentUser?.id || null,
      menteeName: currentUser?.name || "Unknown",
    };
    try {
      const firestoreId = await addSubmission(newSub);
      newSub.id = firestoreId;
      newSub.firestoreId = firestoreId;
    } catch (e) { console.error("addSubmission error:", e); newSub.id = Date.now(); }
    setSubmissions([newSub, ...submissions]);
    setForm({ title: "", course: "" });
    setFileName("");
    setSubmitting(false);
  };

  useEffect(() => {
    if (!authReady) return;
    const loadCourses = async () => {
      try {
        const mentorId = getStoredUser()?.mentorId;
        const coursesData = mentorId ? await getCourses(mentorId) : [];
        setForm(prev => ({ ...prev, course: coursesData[0]?.title || "" }));
      } catch (e) {
        console.error("getCourses error:", e);
        setForm(prev => ({ ...prev, course: "" }));
      }
    };
    loadCourses();
  }, [authReady]);

  const handlePreview = (sub) => setPreview(sub);

  const handleDownload = (sub) => {
    const blob = new Blob([`Simulated file content for: ${sub.file}`], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sub.file;
    a.click();
    URL.revokeObjectURL(url);
  };

    const q = searchTerm.toLowerCase();
  const filteredSubmissions = submissions.filter(s => s.title?.toLowerCase().includes(q) || s.course?.toLowerCase().includes(q));

  useEffect(() => {
    if (!authReady) return;
    const user = getStoredUser();
    const mentorId = user?.mentorId;
    const loadCourses = async () => {
      try {
        const coursesData = await getCourses(mentorId);
        setForm(prev => ({ ...prev, course: coursesData[0]?.title || "" }));
      } catch (e) {
        console.error("getCourses error:", e);
        setForm(prev => ({ ...prev, course: "" }));
      }
    };
    loadCourses();
  }, [authReady]);

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search submissions..." onSearch={setSearchTerm} />
        <PageTitle data-aos="fade-down">{isMentor ? "Mentee Submissions" : "My Submissions"}</PageTitle>

        {!isMentor && (
          <UploadCard data-aos="fade-up" $drag={drag}>
            <UploadTitle>📤 Submit Your Work</UploadTitle>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <div>
                  <Label>Assignment Title</Label>
                  <Select id="submissions-assignment" name="assignment" value={form.title} onChange={(e) => handleAssignmentSelect(e.target.value)}>
                    <option value="">Select an assignment...</option>
                    {acceptedAssignments.map(a => (
                      <option key={a.id} value={a.title}>{a.title}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Course</Label>
                  <Select id="submissions-course" name="course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="">Select course...</option>
                    {activeCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </FormGrid>
              <FileZone
                $drag={drag}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input id="file-input" type="file" style={{ display: "none" }} onChange={handleFile} />
                <FileIcon>{fileName ? "📎" : "📂"}</FileIcon>
                <FileText>{fileName || "Drag & drop your file here"}</FileText>
                <FileSubtext>{fileName ? "Click to change file" : "or click to browse (PDF, DOCX, ZIP up to 10MB)"}</FileSubtext>
              </FileZone>
              <SubmitBtn type="submit" disabled={!form.title || !fileName || submitting}>{submitting ? "⏳ Uploading..." : "Upload Submission"}</SubmitBtn>
            </form>
          </UploadCard>
        )}

        <div data-aos="fade-up">
          <ListHeader>
            <ListTitle>{isMentor ? "Received Submissions" : "My Submissions"}</ListTitle>
            <span style={{ fontSize: "0.85rem", color: "#594048" }}>{submissions.length} total</span>
          </ListHeader>
          {submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#594048" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8, color: "#2c3e50" }}>No submissions yet</div>
              <div style={{ fontSize: "0.9rem" }}>Upload your first assignment above to get started.</div>
            </div>
          ) : (
          <>
          {filteredSubmissions.length === 0 && searchTerm ? <p style={{gridColumn:"1/-1",color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:48}}>No submissions match "{searchTerm}".</p> : filteredSubmissions.map((s, i) => (
            <SubmissionCard key={s.id} data-aos="fade-up" data-aos-delay={i * 50}>
              <SubIcon $color={s.color}>{s.icon}</SubIcon>
              <SubInfo>
                <SubTitle>{s.title}</SubTitle>
                <SubMeta>
                  {isMentor && s.menteeName && <span>👤 {s.menteeName}</span>}
                  <span>📚 {s.course}</span>
                  <span>📎 {s.file} ({s.size})</span>
                  <span>📅 {s.date}</span>
                  <SubStatus $status={s.status}>{s.status === "reviewed" ? "Reviewed" : "Pending"}</SubStatus>
                {s.status === "reviewed" && s.grade !== undefined && !isMentor && (
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: s.grade >= 80 ? "#2e7d32" : s.grade >= 60 ? "#f57f17" : "#c62828" }}>
                    {s.grade}%
                  </span>
                )}
                </SubMeta>
              </SubInfo>
              <SubActions>
                <ActionBtn onClick={() => handlePreview(s)}>👁 Preview</ActionBtn>
                <ActionBtn onClick={() => handleDownload(s)}>⬇ Download</ActionBtn>
                {isMentor && s.status === "pending" && <ActionBtn style={{ background: "#b50064", color: "white", border: "none" }} onClick={() => handleGrade(s)}>✓ Review</ActionBtn>}
                {isMentor && s.grade && <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#b50064" }}>{s.grade}%</span>}
              </SubActions>
            </SubmissionCard>
          ))}
          </>
        )}
        </div>

      {gradeTarget && (
        <PreviewOverlay onClick={() => setGradeTarget(null)}>
          <PreviewCard onClick={(e) => e.stopPropagation()}>
            <PreviewTitle>📝 Grade Submission</PreviewTitle>
            <PreviewDetail><span>Assignment:</span> {gradeTarget.title}</PreviewDetail>
            <PreviewDetail><span>Course:</span> {gradeTarget.course}</PreviewDetail>
            <PreviewDetail><span>File:</span> {gradeTarget.file}</PreviewDetail>
            <PreviewDetail><span>Submitted:</span> {gradeTarget.date}</PreviewDetail>
            <div style={{ marginTop: 20 }}>
              <Label>Grade (0–100)</Label>
              <Input id="submissions-grade" name="grade" type="number" min="0" max="100" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} placeholder="Enter score..." />
            </div>
            <div style={{ marginTop: 12 }}>
              <Label>Feedback</Label>
              <Input id="submissions-feedback" name="feedback" as="textarea" rows="3" value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Write feedback for the mentee..." style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <SubmitBtn type="button" onClick={submitGrade} disabled={grading} style={{ flex: 1 }}>{grading ? "⏳ Saving..." : "Submit Grade"}</SubmitBtn>
              <ActionBtn onClick={() => setGradeTarget(null)} style={{ flex: 1, textAlign: "center" }}>Cancel</ActionBtn>
            </div>
          </PreviewCard>
        </PreviewOverlay>
      )}

      {preview && (
        <PreviewOverlay onClick={() => setPreview(null)}>
          <PreviewCard onClick={(e) => e.stopPropagation()}>
            <PreviewTitle>📄 {preview.title}</PreviewTitle>
            <PreviewDetail><span>Course:</span> {preview.course}</PreviewDetail>
            <PreviewDetail><span>File:</span> {preview.file}</PreviewDetail>
            <PreviewDetail><span>Size:</span> {preview.size}</PreviewDetail>
            <PreviewDetail><span>Submitted:</span> {preview.date}</PreviewDetail>
            <PreviewDetail><span>Status:</span> {preview.status === "reviewed" ? "✅ Reviewed" : "⏳ Pending"}</PreviewDetail>
            {preview.status === "reviewed" && preview.grade !== undefined && (
              <>
                <div style={{ marginTop: 16, padding: 16, background: "#f0f8f0", borderRadius: 12, border: "1px solid #c8e6c9" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#2e7d32", marginBottom: 4 }}>{preview.grade}%</div>
                  <div style={{ fontSize: "0.8rem", color: "#558b2f", fontWeight: 600 }}>Grade</div>
                </div>
                {preview.feedback && (
                  <div style={{ marginTop: 12, padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#333", marginBottom: 6 }}>💬 Mentor Feedback</div>
                    <div style={{ fontSize: "0.9rem", color: "#594048", lineHeight: 1.6 }}>{preview.feedback}</div>
                  </div>
                )}
              </>
            )}
            <PreviewClose onClick={() => setPreview(null)}>Close</PreviewClose>
          </PreviewCard>
        </PreviewOverlay>
      )}
      </Main>
    </Page>
  );
};
