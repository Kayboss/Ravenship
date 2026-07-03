import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getUser, getCourses, getAssignments, addAssignment, updateAssignment, deleteAssignment, addSubmission, getSubmissions } from "../firebase/db";
import { uploadSubmissionFile } from "../lib/upload";
import DOMPurify from "dompurify";

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
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: ${(props) => props.theme.spacing.sm};
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

const EditorContainer = styled.div`
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 10px;
  overflow: hidden;
  background: ${(props) => props.theme.colors.background};
`;

const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.surface};
`;

const ToolbarBtn = styled.button`
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: ${(props) => props.$active ? props.theme.colors.primary + "20" : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: ${(props) => props.$bold ? 700 : 400};
  font-style: ${(props) => props.$italic ? "italic" : "normal"};
  text-decoration: ${(props) => props.$underline ? "underline" : "none"};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: ${(props) => props.theme.colors.primary}15; }
`;

const EditorArea = styled.div`
  min-height: 180px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  &:focus { outline: none; }
  &:empty:before {
    content: attr(data-placeholder);
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: 0.6;
    pointer-events: none;
  }
  h3 { font-size: 1.15rem; margin: 12px 0 6px; }
  h4 { font-size: 1rem; margin: 10px 0 4px; }
  ul, ol { padding-left: 24px; margin: 6px 0; }
  li { margin: 2px 0; }
  p { margin: 4px 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  u { text-decoration: underline; }
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
  &:disabled { opacity: 0.6; cursor: not-allowed; &:hover { background: transparent; color: ${(props) => props.theme.colors.primary}; } }
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

const RichEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&emsp;&emsp;");
    }
  };

  const insertHeading = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const parent = range.commonAncestorContainer.parentElement;
    if (parent?.tagName?.toLowerCase() === tag) {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  };

  return (
    <EditorContainer>
      <EditorToolbar>
        <ToolbarBtn $bold onClick={() => exec("bold")} title="Bold"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn $italic onClick={() => exec("italic")} title="Italic"><em>I</em></ToolbarBtn>
        <ToolbarBtn $underline onClick={() => exec("underline")} title="Underline"><u>U</u></ToolbarBtn>
        <span style={{ width: 1, height: 20, background: "#ccc", margin: "0 4px" }} />
        <ToolbarBtn onClick={() => insertHeading("h3")} title="Heading 3">H3</ToolbarBtn>
        <ToolbarBtn onClick={() => insertHeading("h4")} title="Heading 4">H4</ToolbarBtn>
        <span style={{ width: 1, height: 20, background: "#ccc", margin: "0 4px" }} />
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet List">• List</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Number List">1. List</ToolbarBtn>
      </EditorToolbar>
      <EditorArea
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Write your assignment content here..."}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    </EditorContainer>
  );
};

const truncateHtml = (html, wordLimit) => {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  if (words.length <= wordLimit) return null;
  return words.slice(0, wordLimit).join(" ") + "…";
};

export const Assignments = () => {
  const { role } = useParams();
  const isMentor = role === "mentor" || role === "admin";
  const isMentee = role === "mentee";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");
  const [assignments, setAssignments] = useState([]);
  const [menteeMentorId, setMenteeMentorId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "", course: "", desc: "", content: "", marks: "", due: "",
  });
  const [authReady, setAuthReady] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const currentUser = getStoredUser();
    const load = async () => {
      try {
        if (currentUser?.id && role === "admin") {
          const c = await getCourses();
          if (Array.isArray(c)) setCourses(c);
          const d = await getAssignments();
          const subs = await getSubmissions({}).catch(e => { console.error("getSubmissions error:", e); return []; });
          if (Array.isArray(d)) {
            const subCounts = {};
            (subs || []).forEach(s => {
              const key = s.assignmentTitle || s.assignmentId;
              if (key) subCounts[key] = (subCounts[key] || 0) + 1;
            });
            const courseMap = Object.fromEntries((c || []).map(co => [co.title, (co.enrolledMentees || []).length]));
            setAssignments(d.map(a => ({
              ...a,
              submissions: subCounts[a.title] || subCounts[a.firestoreId || a.id] || a.submissions || 0,
              spots: courseMap[a.course] || a.spots || 0
            })));
          }
        } else if (isMentor && currentUser?.id) {
          const c = await getCourses(currentUser.id);
          if (Array.isArray(c)) setCourses(c);
          const d = await getAssignments(currentUser.id);
          const subs = await getSubmissions({}).catch(e => { console.error("getSubmissions error:", e); return []; });
          if (Array.isArray(d)) {
            const subCounts = {};
            (subs || []).forEach(s => {
              const key = s.assignmentTitle || s.assignmentId;
              if (key) subCounts[key] = (subCounts[key] || 0) + 1;
            });
            const courseMap = Object.fromEntries((c || []).map(co => [co.title, (co.enrolledMentees || []).length]));
            setAssignments(d.map(a => ({
              ...a,
              submissions: subCounts[a.title] || subCounts[a.firestoreId || a.id] || a.submissions || 0,
              spots: courseMap[a.course] || a.spots || 0
            })));
          }
        } else if (isMentee && currentUser?.id) {
          const u = await getUser(currentUser.id);
          const mentorId = u?.mentorId;
          if (mentorId) {
            setMenteeMentorId(mentorId);
            const d = await getAssignments(mentorId);
            if (Array.isArray(d)) setAssignments(d);
          }
        } else {
          const d = await getAssignments();
          if (Array.isArray(d)) setAssignments(d);
        }
      } catch (e) { console.error("load assignments error:", e); }
    };
    load();
  }, [authReady]);

  const currentUser = getStoredUser();
  const mentorFiltered = (() => {
    if (role === "admin") return assignments;
    if (isMentor && currentUser?.id) return assignments.filter(a => a.mentorId === currentUser.id);
    if (isMentee && menteeMentorId) return assignments.filter(a => a.mentorId === menteeMentorId);
    return assignments;
  })();

  const handleEditAssignment = async () => {
    if (!editingAssignment) return;
    setSaving(true);
    try {
      if (editingAssignment.firestoreId) await updateAssignment(editingAssignment.firestoreId, { title: editingAssignment.title, course: editingAssignment.course, desc: editingAssignment.desc, content: editingAssignment.content || "", marks: editingAssignment.marks, due: editingAssignment.due });
    } catch (e) { console.error("updateAssignment error:", e); }
    setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? { ...editingAssignment } : a));
    setEditingAssignment(null);
    setSaving(false);
    alert("Assignment updated!");
  };

  const handleDeleteAssignment = async (id) => {
    const target = assignments.find(a => a.id === id);
    if (!target || !window.confirm(`Delete "${target.title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      if (target.firestoreId) await deleteAssignment(target.firestoreId);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error("deleteAssignment error:", e); alert("Failed to delete assignment."); }
    setDeletingId(null);
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title.trim() || !newAssignment.course) {
      alert("Please fill in all required fields (title, course)");
      return;
    }
    setSaving(true);
    const user = getStoredUser();
    const tempId = Date.now();
    const assignment = {
      id: tempId,
      title: newAssignment.title,
      course: newAssignment.course,
      desc: newAssignment.desc,
      content: newAssignment.content || "",
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
    try {
      const firestoreId = await addAssignment(assignment);
      assignment.firestoreId = firestoreId;
    } catch (e) { console.error("addAssignment error:", e); }
    setAssignments([assignment, ...assignments]);
    setNewAssignment({ title: "", course: "", desc: "", content: "", marks: "", due: "" });
    setShowCreateForm(false);
    setSaving(false);
    alert("Assignment posted!");
  };

  const handleAccept = async (id) => {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    if (a.firestoreId) {
      try { await updateAssignment(a.firestoreId, { status: "accepted" }); } catch (e) { console.error("updateAssignment error:", e); }
    }
    setAssignments(prev => prev.map(x => x.id === id ? { ...x, status: "accepted" } : x));
  };

  const courseFiltered = courseFilter
    ? mentorFiltered.filter(a => a.course === courseFilter)
    : mentorFiltered;

  const filtered = activeTab === "all"
    ? courseFiltered
    : courseFiltered.filter(a => a.status === activeTab);

  const q = searchTerm.toLowerCase();
  const searchedFiltered = filtered.filter(a => a.title?.toLowerCase().includes(q) || a.course?.toLowerCase().includes(q));

  const clearCourseFilter = () => {
    setSearchParams({});
  };

  const tabs = ["all", "available", "accepted", "submitted", "graded"];

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search assignments..." onSearch={setSearchTerm} />
        <style>{`
          .assignment-formatting h3 { font-size: 1.15rem; margin: 12px 0 6px; font-weight: 700; }
          .assignment-formatting h4 { font-size: 1rem; margin: 10px 0 4px; font-weight: 700; }
          .assignment-formatting ul, .assignment-formatting ol { padding-left: 24px; margin: 6px 0; }
          .assignment-formatting li { margin: 2px 0; }
          .assignment-formatting p { margin: 4px 0; }
          .assignment-formatting strong { font-weight: 700; }
          .assignment-formatting em { font-style: italic; }
          .assignment-formatting u { text-decoration: underline; }
          .assignment-clamped { max-height: 120px; overflow: hidden; }
        `}</style>
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
                    <option value="">-- Select a course --</option>
                    {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Description (plain text preview)</FormLabel>
                  <FormTextarea value={newAssignment.desc} onChange={(e) => setNewAssignment({...newAssignment, desc: e.target.value})} placeholder="Brief plain-text description" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Assignment Content</FormLabel>
                  <RichEditor
                    value={newAssignment.content}
                    onChange={(html) => setNewAssignment({...newAssignment, content: html})}
                    placeholder="Write the full assignment with formatting here..."
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Marks</FormLabel>
                  <FormInput type="number" value={newAssignment.marks} onChange={(e) => setNewAssignment({...newAssignment, marks: e.target.value})} placeholder="Enter maximum marks" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Due Date</FormLabel>
                  <FormInput type="date" value={newAssignment.due} onChange={(e) => setNewAssignment({...newAssignment, due: e.target.value})} />
                </FormGroup>
                <SubmitBtn onClick={handleCreateAssignment} disabled={saving}>{saving ? "⏳ Posting..." : "Post Assignment"}</SubmitBtn>
              </CreateFormCard>
            )}
          </div>
        )}

        {isMentor && editingAssignment && (
          <CreateFormCard style={{ border: "2px solid #e67e22" }}>
            <h4 style={{ margin: "0 0 16px", color: "#e67e22" }}>✏️ Edit Assignment</h4>
            <FormGroup>
              <FormLabel>Assignment Title</FormLabel>
              <FormInput type="text" value={editingAssignment.title} onChange={(e) => setEditingAssignment({...editingAssignment, title: e.target.value})} placeholder="Enter assignment title" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Course</FormLabel>
              <FormSelect value={editingAssignment.course} onChange={(e) => setEditingAssignment({...editingAssignment, course: e.target.value})}>
                <option value="">-- Select a course --</option>
                {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
              </FormSelect>
            </FormGroup>
            <FormGroup>
              <FormLabel>Description (plain text preview)</FormLabel>
              <FormTextarea value={editingAssignment.desc} onChange={(e) => setEditingAssignment({...editingAssignment, desc: e.target.value})} placeholder="Brief plain-text description" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Assignment Content</FormLabel>
              <RichEditor
                value={editingAssignment.content || ""}
                onChange={(html) => setEditingAssignment({...editingAssignment, content: html})}
                placeholder="Write the full assignment with formatting here..."
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Marks</FormLabel>
              <FormInput type="number" value={editingAssignment.marks ?? ""} onChange={(e) => setEditingAssignment({...editingAssignment, marks: e.target.value})} placeholder="Enter maximum marks" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Due Date</FormLabel>
              <FormInput type="date" value={editingAssignment.due} onChange={(e) => setEditingAssignment({...editingAssignment, due: e.target.value})} />
            </FormGroup>
            <div style={{ display: "flex", gap: 12 }}>
              <SubmitBtn onClick={handleEditAssignment} disabled={saving}>{saving ? "⏳ Saving..." : "💾 Save Changes"}</SubmitBtn>
              <SubmitBtn onClick={() => setEditingAssignment(null)} style={{ background: "#e0e0e0", color: "#333" }}>Cancel</SubmitBtn>
            </div>
          </CreateFormCard>
        )}

        {courseFilter && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <BackBtn onClick={() => { clearCourseFilter(); navigate(role === "admin" ? "/dashboard/admin/courses" : `/dashboard/${role}/my-courses`); }}>
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

        {searchedFiltered.length === 0 && searchTerm ? <p style={{gridColumn:"1/-1",color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:48}}>No assignments match "{searchTerm}".</p> : searchedFiltered.map((a, i) => (
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
                {isMentor && (
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.7", marginBottom: 8, color: "inherit" }}>
                    {expandedId === a.id && a.content ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.content) }} />
                        <span onClick={() => setExpandedId(null)} style={{ color: "#b50064", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-block", marginTop: 8 }}>▲ Show less</span>
                      </>
                    ) : (
                      <>
                        <Description>{a.desc || a.content ? truncateHtml(a.content, 100) || a.desc : ""}</Description>
                        {a.content && truncateHtml(a.content, 100) && (
                          <span onClick={() => setExpandedId(a.id)} style={{ color: "#b50064", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-block", marginTop: 4 }}>Read more ▼</span>
                        )}
                      </>
                    )}
                  </div>
                )}
                {!isMentor && a.content && (
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.7", marginBottom: 8, color: "inherit" }}>
                    {expandedId === a.id ? (
                      <>
                        <div className="assignment-formatting" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.content) }} />
                        <span onClick={() => setExpandedId(null)} style={{ color: "#b50064", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-block", marginTop: 8 }}>▲ Show less</span>
                      </>
                    ) : (
                      <>
                        <div className="assignment-formatting assignment-clamped" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.content) }} />
                        <span onClick={() => setExpandedId(a.id)} style={{ color: "#b50064", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-block", marginTop: 8 }}>Read more ▼</span>
                      </>
                    )}
                  </div>
                )}
                {!isMentor && !a.content && <Description>{a.desc}</Description>}
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
                  <ViewSubmissionsBtn style={{ borderColor: "#e67e22", color: "#e67e22" }} onClick={() => setEditingAssignment({ ...a })}>
                    ✏️ Edit
                  </ViewSubmissionsBtn>
                  <ViewSubmissionsBtn style={{ borderColor: "#e53935", color: "#e53935", opacity: deletingId === a.id ? 0.6 : 1 }} onClick={() => handleDeleteAssignment(a.id)} disabled={deletingId === a.id}>
                    {deletingId === a.id ? "⏳ Deleting..." : "🗑 Delete"}
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
                    if (f.size > 5000000) { alert("File too large. Maximum size is 5MB."); return; }
                    let fileUrl = "";
                    try {
                      fileUrl = await uploadSubmissionFile(f, Date.now().toString());
                    } catch { alert("File upload failed. Try again."); return; }
                    const u = getStoredUser();
                    const subData = {
                      assignmentId: a.id,
                      assignmentTitle: a.title,
                      course: a.course,
                      fileName: f.name,
                      fileUrl: fileUrl,
                      fileSize: (f.size / 1024).toFixed(0) + " KB",
                      menteeId: u?.id || null,
                      menteeName: u?.name || "Unknown",
                    };
                    await addSubmission(subData).catch(e => console.error("addSubmission error:", e));
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
