import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getCourses, addCourse, updateCourse, deleteCourse, getUser, getUsers, enrollMentee, getAssignments } from "../firebase/db";

const truncateWords = (text, max = 25) => text?.split(" ").slice(0, max).join(" ") + (text?.split(" ").length > max ? "..." : "");

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
`;

const CardImage = styled.div`
  height: 140px;
  border-radius: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary}15, ${(props) => props.theme.colors.secondary}15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => props.theme.colors.primary}10;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const CardTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 16px;
`;

const ProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 8px;
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
  width: ${(props) => props.$w}%;
  background: ${(props) => props.theme.colors.primaryContainer};
  border-radius: 50px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${(props) => props.theme.colors.outline};
`;

const AssignBtn = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: transparent;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { background: ${(props) => props.theme.colors.primary}10; border-color: ${(props) => props.theme.colors.primary}; color: ${(props) => props.theme.colors.primary}; }
`;

const AssignmentCount = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  background: ${(props) => props.theme.colors.background};
  padding: 2px 10px;
  border-radius: 50px;
  margin-left: 8px;
`;

const ViewBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { opacity: 0.9; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Modal = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 28px;
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  height: 160px;
  border-radius: 28px 28px 0 0;
  background: linear-gradient(135deg, ${(props) => props.color || props.theme.colors.primary}, ${(props) => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(0, 0, 0, 0.4); }
`;

const ModalBody = styled.div`
  padding: 28px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const ModalBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.theme.colors.primary}10;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 16px;
`;

const FullDesc = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const MetaBox = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  text-align: center;

  p:first-child { font-size: 1.3rem; margin-bottom: 4px; }
  p:nth-child(2) { font-weight: 700; color: ${(props) => props.theme.colors.textPrimary}; font-size: 0.9rem; }
  p:last-child { font-size: 0.7rem; color: ${(props) => props.theme.colors.textSecondary}; }
`;

const SyllabusSection = styled.div`
  margin-bottom: 24px;
`;

const SyllabusTitle = styled.h4`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 12px;
  font-size: 1rem;
`;

const SyllabusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}40;

  &:last-child { border-bottom: none; }

  span:first-child {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.primary}10;
    color: ${(props) => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  p {
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.textPrimary};
  }
`;

const StartBtn = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const ContinueBtn = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid ${(props) => props.theme.colors.primary};
  background: ${(props) => props.theme.colors.primary}10;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { background: ${(props) => props.theme.colors.primary}; color: white; }
`;

const Instructor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${(props) => props.theme.colors.outline};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
`;

const InstructorAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.secondary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.secondary};
`;

const InstructorName = styled.p`
  font-weight: 600;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const InstructorTitle = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const instructorBios = {
  "Marcus Chen": { bio: "Marcus is a Lead Designer with 10+ years of experience in design systems and component architecture. He has led design at top tech companies and is passionate about teaching scalable design practices.", avatarColor: "#b50064" },
  "Aisha Patel": { bio: "Aisha is a Senior Data Scientist specializing in business intelligence and data visualization. She holds a PhD in Statistics and has consulted for Fortune 500 companies.", avatarColor: "#006590" },
  "Dr. Sarah Jenkins": { bio: "Dr. Jenkins is a UX Director and Design Thinking coach with 15+ years in human-centered design. She has taught at Stanford's d.school and led UX for multiple unicorn startups.", avatarColor: "#ffd200" },
  "James Wilson": { bio: "James is a Software Architect with expertise in full-stack development and cloud infrastructure. He has built platforms serving millions of users and mentors engineers across the globe.", avatarColor: "#006590" },
  "Maria Gonzalez": { bio: "Maria is a Product Management Lead who has launched 20+ products across SaaS and consumer tech. She combines agile methodologies with strategic thinking to drive product success.", avatarColor: "#ffd200" },
  "Tom Nakamura": { bio: "Tom is a Brand Director and creative strategist who has built identities for global brands. His work spans visual design, narrative development, and brand transformation.", avatarColor: "#b50064" },
};

const BioOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BioCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 28px 32px;
  width: 340px;
  text-align: center;
`;

const BioAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) => props.$color || props.theme.colors.primary}25;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.3rem;
  color: ${(props) => props.$color || props.theme.colors.primary};
  margin: 0 auto 12px;
`;

const BioName = styled.p`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const BioRole = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const BioText = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  text-align: left;
`;

const BioCloseBtn = styled.button`
  margin-top: 20px;
  padding: 8px 28px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const MentorStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const StatBox = styled.div`
  flex: 1;
  background: ${(props) => props.theme.colors.background};
  border-radius: 12px;
  padding: 12px;
  text-align: center;

  p:first-child {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${(props) => props.theme.colors.textPrimary};
  }

  p:last-child {
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const MenteesSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${(props) => props.theme.colors.outline};
`;

const MenteeLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const MenteeList = styled.div`
  display: flex;
  gap: 8px;
`;

const MenteeInitial = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

const EditBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: 2px solid ${(props) => props.theme.colors.primary};
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.primary}; color: #fff; }
`;

const ManageBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { opacity: 0.9; }
`;

const CreateNewCard = styled.div`
  border-radius: 24px;
  border: 2px dashed ${(props) => props.theme.colors.outline};
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background: ${(props) => props.theme.colors.surface};
  }
`;

const CreateIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primaryContainer};
  transition: transform 0.3s;
  ${CreateNewCard}:hover & {
    transform: scale(1.1);
  }
`;

const CreateText = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const CreateSubtext = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
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
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const EmojiGrid = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmojiOption = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid ${(props) => props.$selected ? props.theme.colors.primary : props.theme.colors.outline};
  background: ${(props) => props.$selected ? `${props.theme.colors.primary}15` : props.theme.colors.background};
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const CreateProgramBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const MyCourses = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses, enrollCourse } = useCourses();
  const [selected, setSelected] = useState(null);
  const [bioView, setBioView] = useState(null);
  const isMentor = role === "mentor";
  const isMentee = role === "mentee";
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", badge: "Design", emoji: "🎨", duration: "", level: "Beginner", featuredImage: "" });

  const currentUser = getStoredUser();
  const mentorName = currentUser?.name || "You";
  const mentorKey = (() => { try { const u = getStoredUser(); return `myCourses_${u?.email || "default"}`; } catch { return "myCourses_default"; } })();
  const loadLocalCourses = () => {
    try { const d = localStorage.getItem(mentorKey); if (d) return JSON.parse(d); } catch {}
    return null;
  };
  const syncLocalCourses = (list) => {
    const slim = list.map(({ featuredImage, ...rest }) => rest);
    try {
      localStorage.setItem(mentorKey, JSON.stringify(slim));
    } catch (e) {
      if (e.name === "QuotaExceededError" || e.code === 22) {
        try {
          localStorage.removeItem(mentorKey);
          localStorage.setItem(mentorKey, JSON.stringify(slim));
        } catch {}
      }
    }
  };

  const [coursesList, setCoursesList] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    const load = async () => {
      try {
        let mentorFilter = null;
        if (isMentor && currentUser?.id) {
          mentorFilter = currentUser.id;
        } else if (isMentee && currentUser?.id) {
          const u = await getUser(currentUser.id);
          if (u?.mentorId) mentorFilter = u.mentorId;
        }
        const allUsers = await getUsers();
        const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]));
        const firestoreCourses = await getCourses(mentorFilter);
        const enrich = (courses) => courses.map(c => {
          const lessonTopics = typeof c.lessonContent === 'object' && c.lessonContent !== null
            ? Object.keys(c.lessonContent)
            : (Array.isArray(c.syllabus) ? c.syllabus : []);
          return {
            ...c,
            syllabus: lessonTopics,
            enrolledMentees: c.enrolledMentees || [],
            menteeInitials: (c.enrolledMentees || []).map(id => {
              const u = userMap[id];
              return u?.name ? u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : null;
            }).filter(Boolean)
          };
        });
        const localCourses = loadLocalCourses();
        if (localCourses) {
          const existingTitles = new Set(firestoreCourses.map(c => c.title));
          const newLocals = localCourses.filter(c => !existingTitles.has(c.title));
          const merged = enrich([...newLocals, ...firestoreCourses]);
          setCoursesList(merged);
          syncLocalCourses(merged);
        } else {
          const enriched = enrich(firestoreCourses);
          setCoursesList(enriched);
          syncLocalCourses(enriched);
        }
      } catch {
        const fallback = loadLocalCourses() || [];
        setCoursesList(fallback);
      }
    };
    load();
  }, [authReady]);

  useEffect(() => {
    syncLocalCourses(coursesList);
  }, [coursesList, mentorKey]);

  useEffect(() => {
    getAssignments().then(d => {
      if (Array.isArray(d)) {
        const counts = {};
        for (const a of d) {
          if (a.course) counts[a.course] = (counts[a.course] || 0) + 1;
        }
        setAssignmentCounts(counts);
      }
    }).catch(e => console.error("getAssignments error:", e));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.desc.trim() || !form.duration.trim()) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    const newCourse = {
      title: form.title,
      desc: form.desc,
      fullDesc: form.desc,
      badge: form.badge,
      emoji: form.emoji,
      featuredImage: form.featuredImage || "",
      instructor: mentorName,
      role: "Mentor",
      createdBy: currentUser?.id || null,
      assignments: 0,
      duration: form.duration + " weeks",
      lessons: 0,
      level: form.level,
      syllabus: [],
      progress: 0,
      enrolled: 0,
      enrolledMentees: [],
    };
    try {
      const id = await addCourse(newCourse);
      setCoursesList(prev => [{ ...newCourse, id }, ...prev]);
    } catch {
      alert("Failed to save program to server. Saved locally instead.");
      setCoursesList(prev => [newCourse, ...prev]);
    }
    setShowCreate(false);
    setForm({ title: "", desc: "", badge: "Design", emoji: "🎨", duration: "", level: "Beginner", featuredImage: "" });
    setSaving(false);
    alert("Program created!");
  };

  const handleEdit = (course) => {
    setEditTarget({ ...course, _origTitle: course.title });
  };

  const saveEdit = async () => {
    if (!editTarget.title.trim()) return alert("Title is required");
    setSaving(true);
    const updated = { ...editTarget };
    delete updated._origTitle;
    delete updated.id;
    if (editTarget.id) {
      try { await updateCourse(editTarget.id, updated); } catch { alert("Failed to save changes to server."); setSaving(false); return; }
    }
    setCoursesList(prev => prev.map(c => (c.id && c.id === editTarget.id) || (!c.id && c.title === editTarget._origTitle) ? { ...editTarget } : c));
    setEditTarget(null);
    setSaving(false);
    alert("Program updated!");
  };

  const confirmDelete = (course) => {
    if (course.enrolled > 0) {
      alert(`Cannot delete "${course.title}" — ${course.enrolled} mentee(s) are already enrolled in this program.`);
      return;
    }
    setDeleteTarget(course);
  };

  const doDelete = async () => {
    setDeletingId(deleteTarget?.id || "local");
    if (deleteTarget.id) {
      try { await deleteCourse(deleteTarget.id); } catch { alert("Failed to delete program from server."); setDeletingId(null); return; }
    }
    setCoursesList(prev => prev.filter(c => (c.id && c.id !== deleteTarget.id) || (!c.id && c.title !== deleteTarget.title)));
    setDeleteTarget(null);
    setDeletingId(null);
    alert("Program deleted!");
  };

  const doBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected program(s)? This cannot be undone.`)) return;
    setSaving(true);
    const toDelete = coursesList.filter(c => selectedIds.includes(c.id || c.title));
    const firestoreIds = toDelete.filter(c => c.id).map(c => c.id);
    for (const id of firestoreIds) {
      try { await deleteCourse(id); } catch {}
    }
    setCoursesList(prev => prev.filter(c => !selectedIds.includes(c.id || c.title)));
    setSelectedIds([]);
    setSaving(false);
    alert("Selected programs deleted!");
  };
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search courses..." />
        <PageTitle data-aos="fade-down">{isMentor ? "My Programs" : "My Courses"}</PageTitle>
        {isMentor && coursesList.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#594048" }}>
              <input id="myCourses-selectAll" name="selectAll" type="checkbox" checked={selectedIds.length === coursesList.length && coursesList.length > 0} onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(coursesList.map(c => c.id || c.title));
                } else {
                  setSelectedIds([]);
                }
              }} style={{ width: 18, height: 18, cursor: "pointer" }} />
              Select All ({coursesList.length})
            </label>
            {selectedIds.length > 0 && (
              <button onClick={doBulkDelete} disabled={saving} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e53935", color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, fontSize: "0.85rem", fontFamily: "inherit" }}>
                {saving ? "⏳ Deleting..." : `🗑 Delete Selected (${selectedIds.length})`}
              </button>
            )}
          </div>
        )}
        <Grid>
          {coursesList.map((c, i) => isMentor ? (
            <Card key={i} data-aos="fade-up" data-aos-delay={i * 50} style={{ position: "relative", outline: selectedIds.includes(c.id || c.title) ? "2px solid #b50064" : "none" }}>
              <label style={{ position: "absolute", top: 12, left: 12, zIndex: 2, cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
                <input id={`myCourses-checkbox-${c.id || c.title}`} name={`course-${c.id || c.title}`} type="checkbox" checked={selectedIds.includes(c.id || c.title)} onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(prev => [...prev, c.id || c.title]);
                  } else {
                    setSelectedIds(prev => prev.filter(x => x !== (c.id || c.title)));
                  }
                }} style={{ width: 18, height: 18, cursor: "pointer" }} />
              </label>
              <CardImage>{c.featuredImage ? <img src={c.featuredImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16,position:"absolute",inset:0}} /> : c.emoji}</CardImage>
              <Badge>{c.badge}</Badge>
              <CardTitle>{c.title}</CardTitle>
              <CardDesc>{truncateWords(c.desc)}</CardDesc>
              <MentorStats>
                <StatBox>
                  <p>{c.enrolledMentees?.length || 0}</p>
                  <p>enrolled</p>
                </StatBox>
                <StatBox>
                  <p>{assignmentCounts[c.title] || 0}</p>
                  <p>assignments</p>
                </StatBox>
              </MentorStats>
              <MenteesSection>
                <MenteeLabel>Mentees</MenteeLabel>
                <MenteeList>
                  {(c.menteeInitials || []).slice(0, 5).map((init, idx) => (
                    <MenteeInitial key={idx}>{init}</MenteeInitial>
                  ))}
                  {(c.enrolledMentees?.length || 0) > 5 && (
                    <MenteeInitial style={{background:"#594048"}}>+{c.enrolledMentees.length - 5}</MenteeInitial>
                  )}
                </MenteeList>
              </MenteesSection>
              <CardActions>
                <EditBtn onClick={() => handleEdit(c)}>✏️ Edit</EditBtn>
                <ManageBtn onClick={() => navigate(`/dashboard/${role}/course/${encodeURIComponent(c.title)}`)}>⚙️ Manage</ManageBtn>
              </CardActions>
              <AssignBtn onClick={() => navigate(`/dashboard/${role}/assignments?course=${encodeURIComponent(c.title)}`)}>
                📝 Assignments
              </AssignBtn>
            </Card>
          ) : (
            <Card key={i} data-aos="fade-up" data-aos-delay={i * 50}>
              <CardImage style={c.featuredImage ? {overflow:"hidden"} : {}}>
                {c.featuredImage ? <img src={c.featuredImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16,position:"absolute",inset:0}} /> : c.emoji}
                {enrolledCourses[c.title] && <span style={{ position: "absolute", top: 12, right: 12, background: "#b50064", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "4px 10px", borderRadius: "50px" }}>Active</span>}
              </CardImage>
              <Badge>{c.badge}</Badge>
              <CardTitle>{c.title}</CardTitle>
              <CardDesc>{truncateWords(c.desc)}</CardDesc>
              {enrolledCourses[c.title] && (
                <>
                  <ProgressRow>
                    <span style={{ color: "#006590", fontWeight: 600 }}>{enrolledCourses[c.title].progress}% Complete</span>
                    <AssignmentCount>{(assignmentCounts[c.title] || 0)} assignment{(assignmentCounts[c.title] || 0) > 1 ? "s" : ""}</AssignmentCount>
                  </ProgressRow>
                  <ProgressBar>
                    <ProgressFill $w={enrolledCourses[c.title].progress} />
                  </ProgressBar>
                </>
              )}
              <CardActions>
                <ViewBtn onClick={() => setSelected(c)}>📖 View Course</ViewBtn>
                <AssignBtn onClick={() => navigate(`/dashboard/${role}/assignments?course=${encodeURIComponent(c.title)}`)}>
                  📝 Assignments
                </AssignBtn>
              </CardActions>
              <Instructor onClick={() => setBioView(c)}>
                <InstructorAvatar>{c.instructor.split(" ").map(w => w[0]).join("")}</InstructorAvatar>
                <div>
                  <InstructorName>{c.instructor}</InstructorName>
                  <InstructorTitle>{c.role}</InstructorTitle>
                </div>
              </Instructor>
            </Card>
          ))}
          {isMentor && (
            <CreateNewCard onClick={() => setShowCreate(true)} data-aos="fade-up">
              <CreateIcon>+</CreateIcon>
              <CreateText>+ Create New Program</CreateText>
              <CreateSubtext>Design a new learning path</CreateSubtext>
            </CreateNewCard>
          )}
        </Grid>
      </Main>

      {selected && (
        <Overlay onClick={() => setSelected(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader color={selected.emoji === "🎨" ? "#b50064" : selected.emoji === "📊" ? "#006590" : selected.emoji === "💡" ? "#ffd200" : selected.emoji === "⚛️" ? "#006590" : selected.emoji === "🚀" ? "#ffd200" : "#b50064"}>
              <span style={{ fontSize: "4rem" }}>{selected.emoji}</span>
              <CloseBtn onClick={() => setSelected(null)}>✕</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <ModalBadge>{selected.badge} · {selected.level}</ModalBadge>
              <ModalTitle>{selected.title}</ModalTitle>
              <FullDesc>{selected.fullDesc}</FullDesc>

              <MetaGrid>
                <MetaBox>
                  <p>📅</p>
                  <p>{selected.duration}</p>
                  <p>Duration</p>
                </MetaBox>
                <MetaBox>
                  <p>📖</p>
                  <p>{typeof selected.lessons === 'object' && selected.lessons !== null ? Object.keys(selected.lessons).length : (typeof selected.lessons === 'number' ? selected.lessons : (Array.isArray(selected.syllabus) ? selected.syllabus.length : 0))} lessons</p>
                  <p>Course content</p>
                </MetaBox>
                <MetaBox>
                  <p>📝</p>
                  <p>{assignmentCounts[selected.title] || 0}</p>
                  <p>Assignments</p>
                </MetaBox>
              </MetaGrid>

              <SyllabusSection>
                <SyllabusTitle>Course Syllabus</SyllabusTitle>
                {Array.isArray(selected.syllabus) && selected.syllabus.map((topic, i) => (
                  <SyllabusItem key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{typeof topic === 'string' ? topic : String(topic ?? "")}</p>
                  </SyllabusItem>
                ))}
              </SyllabusSection>

              {enrolledCourses[selected.title] && (
                <p style={{ textAlign: "center", marginBottom: 16, fontSize: "0.85rem", color: "#594048" }}>
                  📖 {enrolledCourses[selected.title].progress}% complete
                </p>
              )}
              {enrolledCourses[selected.title] ? (
                <ContinueBtn onClick={() => { setSelected(null); navigate(`/dashboard/${role}/course/${encodeURIComponent(selected.title)}`); }}>
                  ▶ Continue — {Array.isArray(selected.syllabus) ? (selected.syllabus[enrolledCourses[selected.title].lastTopic ?? 0] ?? "Course") : "Course"}
                </ContinueBtn>
              ) : (
                <StartBtn onClick={async () => { enrollCourse(selected.title); if (selected.id && currentUser?.id) { try { await enrollMentee(selected.id, currentUser.id); } catch (e) { console.error("Enrollment failed", e); } } setSelected(null); navigate(`/dashboard/${role}/course/${encodeURIComponent(selected.title)}`); }}>
                  🚀 Start Course — {Array.isArray(selected.syllabus) && selected.syllabus.length > 0 ? selected.syllabus[0] : "Begin"}
                </StartBtn>
              )}
              {enrolledCourses[selected.title] && !isMentor && (
                <button onClick={() => { if (confirm(`Unenroll from "${selected.title}"?`)) { const e = { ...enrolledCourses }; delete e[selected.title]; localStorage.setItem("enrolledCourses", JSON.stringify(e)); setSelected(null); window.location.reload(); } }}
                  style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 12, border: "1px solid #e53935", background: "transparent", color: "#e53935", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  ✕ Unenroll from this course
                </button>
              )}
            </ModalBody>
          </Modal>
        </Overlay>
      )}

      {bioView && (
        <BioOverlay onClick={() => setBioView(null)}>
          <BioCard onClick={(e) => e.stopPropagation()}>
            <BioAvatar $color={instructorBios[bioView.instructor]?.avatarColor}>{bioView.instructor.split(" ").map(w => w[0]).join("")}</BioAvatar>
            <BioName>{bioView.instructor}</BioName>
            <BioRole>{bioView.role}</BioRole>
            <BioText>{instructorBios[bioView.instructor]?.bio || "Instructor bio coming soon."}</BioText>
            <BioCloseBtn onClick={() => setBioView(null)}>Close</BioCloseBtn>
          </BioCard>
        </BioOverlay>
      )}

      {showCreate && (
        <Overlay onClick={() => setShowCreate(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span style={{ fontSize: "3rem" }}>{form.emoji}</span>
              <CloseBtn onClick={() => setShowCreate(false)}>✕</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <ModalTitle>Create New Program</ModalTitle>

              <FormGroup>
                <FormLabel>Program Title</FormLabel>
                <FormInput id="course-title-create" name="title" placeholder="e.g. Advanced UI/UX Systems" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea id="course-desc-create" name="description" placeholder="Describe the program..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormInput id="course-category-create" name="category" placeholder="e.g. Design, Engineering, Business" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {["🎨", "📊", "💡", "⚛️", "🚀", "✨"].map((e) => (
                    <EmojiOption key={e} $selected={form.emoji === e} onClick={() => setForm({ ...form, emoji: e })}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>

              <FormGroup>
                <FormLabel>Featured Image</FormLabel>
                {form.featuredImage && (
                  <div style={{ position:"relative", marginBottom:8, maxHeight:140, overflow:"hidden", borderRadius:12 }}>
                    <img src={form.featuredImage} alt="" style={{ width:"100%", maxHeight:140, objectFit:"cover", borderRadius:12, display:"block" }} />
                    <button onClick={() => setForm({ ...form, featuredImage: "" })}
                      style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", border:"none", background:"rgba(0,0,0,0.5)", color:"#fff", cursor:"pointer", fontSize:"0.8rem" }}>✕</button>
                  </div>
                )}
                <input type="file" id="featured-image-create" accept="image/*" onChange={(e) => { const f=e.target.files?.[0]; if (!f) return; if (f.size > 500 * 1024) { alert("Image too large. Please choose an image under 500KB."); return; } const r=new FileReader(); r.onload=(ev) => setForm({ ...form, featuredImage: ev.target.result }); r.readAsDataURL(f); }}
                  style={{ fontSize:"0.85rem", fontFamily:"inherit" }} />
              </FormGroup>

              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Duration (weeks)</FormLabel>
                  <FormInput id="course-duration-create" name="duration" type="number" placeholder="e.g. 8" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect id="course-level-create" name="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </FormSelect>
                </FormGroup>
              </div>

              <CreateProgramBtn onClick={handleCreate} disabled={saving}>
                {saving ? "⏳ Creating..." : "✨ Create Program"}
              </CreateProgramBtn>
            </ModalBody>
          </Modal>
        </Overlay>
      )}

      {editTarget && (
        <Overlay onClick={() => setEditTarget(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span style={{ fontSize: "3rem" }}>{editTarget.emoji}</span>
              <CloseBtn onClick={() => setEditTarget(null)}>✕</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <ModalTitle>Edit Program</ModalTitle>
              <FormGroup>
                <FormLabel>Program Title</FormLabel>
                <FormInput id="course-title-edit" name="title" value={editTarget.title} onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea id="course-desc-edit" name="description" value={editTarget.desc} onChange={(e) => setEditTarget({ ...editTarget, desc: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormInput id="course-category-edit" name="category" placeholder="e.g. Design, Engineering, Business" value={editTarget.badge} onChange={(e) => setEditTarget({ ...editTarget, badge: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {["🎨", "📊", "💡", "⚛️", "🚀", "✨"].map((e) => (
                    <EmojiOption key={e} $selected={editTarget.emoji === e} onClick={() => setEditTarget({ ...editTarget, emoji: e })}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>
              <FormGroup>
                <FormLabel>Featured Image</FormLabel>
                {editTarget.featuredImage && (
                  <div style={{ position:"relative", marginBottom:8, maxHeight:140, overflow:"hidden", borderRadius:12 }}>
                    <img src={editTarget.featuredImage} alt="" style={{ width:"100%", maxHeight:140, objectFit:"cover", borderRadius:12, display:"block" }} />
                    <button onClick={() => setEditTarget({ ...editTarget, featuredImage: "" })}
                      style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", border:"none", background:"rgba(0,0,0,0.5)", color:"#fff", cursor:"pointer", fontSize:"0.8rem" }}>✕</button>
                  </div>
                )}
                <input type="file" id="featured-image-edit" accept="image/*" onChange={(e) => { const f=e.target.files?.[0]; if (!f) return; if (f.size > 500 * 1024) { alert("Image too large. Please choose an image under 500KB."); return; } const r=new FileReader(); r.onload=(ev) => setEditTarget({ ...editTarget, featuredImage: ev.target.result }); r.readAsDataURL(f); }}
                  style={{ fontSize:"0.85rem", fontFamily:"inherit" }} />
              </FormGroup>
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect id="course-level-edit" name="level" value={editTarget.level} onChange={(e) => setEditTarget({ ...editTarget, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </FormSelect>
                </FormGroup>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <CreateProgramBtn onClick={saveEdit} disabled={saving} style={{ flex: 1 }}>{saving ? "⏳ Saving..." : "💾 Save Changes"}</CreateProgramBtn>
                <CreateProgramBtn onClick={() => setEditTarget(null)} style={{ flex: 1, background: "#e0e0e0", color: "#333" }}>Cancel</CreateProgramBtn>
              </div>
            </ModalBody>
          </Modal>
        </Overlay>
      )}

      {deleteTarget && (
        <Overlay onClick={() => setDeleteTarget(null)}>
          <Modal onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <ModalBody style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🗑</div>
              <ModalTitle>Delete Program?</ModalTitle>
              <p style={{ color: "#594048", marginBottom: 24 }}>Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <CreateProgramBtn onClick={doDelete} disabled={!!deletingId} style={{ flex: 1, background: "#e53935" }}>{deletingId ? "⏳ Deleting..." : "Yes, Delete"}</CreateProgramBtn>
                <CreateProgramBtn onClick={() => setDeleteTarget(null)} style={{ flex: 1, background: "#e0e0e0", color: "#333" }}>Cancel</CreateProgramBtn>
              </div>
            </ModalBody>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
};
