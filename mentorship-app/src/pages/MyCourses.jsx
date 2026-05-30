import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser } from "../firebase/auth";
import { getCourses } from "../firebase/db";

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
  flex: 1;
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
`;

const courses = [
  { title: "Advanced UI/UX Systems", desc: "Master scalable design systems and component-driven architecture.", fullDesc: "Dive deep into the world of modern UI/UX architecture. This course covers design token management, component-driven development, accessibility-first design, and cross-platform consistency. You'll build a production-grade component library from scratch.", badge: "Design", progress: 75, emoji: "🎨", instructor: "Marcus Chen", role: "Lead Designer", assignments: 2, duration: "8 weeks", lessons: 24, level: "Intermediate", syllabus: ["Design Token Architecture", "Component Composition Patterns", "Accessibility & Inclusive Design", "Design System Documentation", "Cross-Platform Consistency", "Versioning & Release Workflows"], enrolled: 12 },
  { title: "Strategic Data Insights", desc: "Translate complex datasets into actionable business strategies.", fullDesc: "Learn how to transform raw data into strategic business decisions. This course covers exploratory data analysis, visualization best practices, statistical modeling, and storytelling with data. Work through real-world business cases and present your findings.", badge: "Business", progress: 40, emoji: "📊", instructor: "Aisha Patel", role: "Data Scientist", assignments: 1, duration: "6 weeks", lessons: 18, level: "Intermediate", syllabus: ["Exploratory Data Analysis", "Data Visualization Principles", "Statistical Foundations", "Business Case Frameworks", "Presentation & Storytelling", "Capstone Project"], enrolled: 8 },
  { title: "Design Thinking Fundamentals", desc: "Learn human-centered design processes and ideation techniques.", fullDesc: "Master the five-stage design thinking process: Empathize, Define, Ideate, Prototype, and Test. You'll work through hands-on exercises, conduct user interviews, create journey maps, and prototype solutions. Ideal for anyone looking to solve problems creatively.", badge: "Design", progress: 92, emoji: "💡", instructor: "Dr. Sarah Jenkins", role: "UX Director", assignments: 1, duration: "5 weeks", lessons: 15, level: "Beginner", syllabus: ["Empathy & User Research", "Problem Definition", "Ideation & Brainstorming", "Rapid Prototyping", "User Testing & Iteration"], enrolled: 15 },
  { title: "Full-Stack Web Development", desc: "Build modern web applications with React, Node, and cloud services.", fullDesc: "From zero to deployed — build a complete full-stack application using React for the frontend, Node.js/Express for the backend, and cloud services for deployment. Covers REST APIs, authentication, database design, and CI/CD pipelines.", badge: "Engineering", progress: 60, emoji: "⚛️", instructor: "James Wilson", role: "Software Architect", assignments: 1, duration: "10 weeks", lessons: 30, level: "Advanced", syllabus: ["React & Component Architecture", "Node.js & Express APIs", "Database Design & SQL", "Authentication & Security", "Testing & CI/CD", "Cloud Deployment"], enrolled: 22 },
  { title: "Product Management 101", desc: "From ideation to launch — master the product lifecycle.", fullDesc: "Learn the end-to-end product management lifecycle: market research, user personas, feature prioritization, roadmap planning, sprint management, and launch strategy. Includes real-world case studies from successful product launches.", badge: "Business", progress: 15, emoji: "🚀", instructor: "Maria Gonzalez", role: "PM Lead", assignments: 1, duration: "7 weeks", lessons: 21, level: "Beginner", syllabus: ["Market Research & Analysis", "User Personas & Stories", "Feature Prioritization", "Roadmap Planning", "Agile & Sprint Management", "Launch & Go-to-Market"], enrolled: 5 },
  { title: "Creative Brand Strategy", desc: "Develop compelling brand identities and marketing narratives.", fullDesc: "Build brands that resonate. This course covers brand positioning, visual identity systems, tone of voice, and narrative design. You'll create a complete brand guide for a real or fictional company, from mood boards to final deliverables.", badge: "Design", progress: 55, emoji: "✨", instructor: "Tom Nakamura", role: "Brand Director", assignments: 1, duration: "6 weeks", lessons: 18, level: "Intermediate", syllabus: ["Brand Positioning & Strategy", "Visual Identity Systems", "Tone of Voice & Messaging", "Mood Boards & Concepting", "Brand Guidelines", "Portfolio Presentation"], enrolled: 3 },
];

export const MyCourses = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses, enrollCourse } = useCourses();
  const [selected, setSelected] = useState(null);
  const [bioView, setBioView] = useState(null);
  const isMentor = role === "mentor";
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", badge: "Design", emoji: "🎨", duration: "", level: "Beginner" });

  const mentorKey = (() => { try { const u = getStoredUser(); return `myCourses_${u?.email || "default"}`; } catch { return "myCourses_default"; } })();
  const loadCourses = () => {
    try { const d = localStorage.getItem(mentorKey); if (d) return JSON.parse(d); } catch {}
    return courses;
  };

  const [coursesList, setCoursesList] = useState(loadCourses);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { localStorage.setItem(mentorKey, JSON.stringify(coursesList)); }, [coursesList, mentorKey]);

  const handleCreate = () => {
    if (!form.title.trim() || !form.desc.trim() || !form.duration.trim()) {
      alert("Please fill in all fields");
      return;
    }
    const newCourse = {
      title: form.title,
      desc: form.desc,
      fullDesc: form.desc,
      badge: form.badge,
      emoji: form.emoji,
      instructor: "You",
      role: "Mentor",
      assignments: 0,
      duration: form.duration + " weeks",
      lessons: 0,
      level: form.level,
      syllabus: [],
      progress: 0,
      enrolled: 0,
    };
    setCoursesList(prev => [newCourse, ...prev]);
    setShowCreate(false);
    setForm({ title: "", desc: "", badge: "Design", emoji: "🎨", duration: "", level: "Beginner" });
    getCourses().catch(() => {});
    alert("Program created!");
  };

  const handleEdit = (course) => {
    setEditTarget({ ...course, _origTitle: course.title });
  };

  const saveEdit = () => {
    if (!editTarget.title.trim()) return alert("Title is required");
    setCoursesList(prev => prev.map(c => c.title === editTarget.title || c.title === editTarget._origTitle ? editTarget : c));
    setEditTarget(null);
    alert("Program updated!");
  };

  const confirmDelete = (course) => {
    if (course.enrolled > 0) {
      alert(`Cannot delete "${course.title}" — ${course.enrolled} mentee(s) are already enrolled in this program.`);
      return;
    }
    setDeleteTarget(course);
  };

  const doDelete = () => {
    setCoursesList(prev => prev.filter(c => c.title !== deleteTarget.title));
    setDeleteTarget(null);
    alert("Program deleted!");
  };
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search courses..." />
        <PageTitle data-aos="fade-down">{isMentor ? "My Programs" : "My Courses"}</PageTitle>
        <Grid>
          {coursesList.map((c, i) => isMentor ? (
            <Card key={i} data-aos="fade-up" data-aos-delay={i * 50}>
              <CardImage>{c.emoji}</CardImage>
              <Badge>{c.badge}</Badge>
              <CardTitle>{c.title}</CardTitle>
              <CardDesc>{c.desc}</CardDesc>
              <MentorStats>
                <StatBox>
                  <p>{c.enrolled}</p>
                  <p>enrolled</p>
                </StatBox>
                <StatBox>
                  <p>{c.assignments}</p>
                  <p>assignments</p>
                </StatBox>
              </MentorStats>
              <MenteesSection>
                <MenteeLabel>Mentees</MenteeLabel>
                <MenteeList>
                  {["AR","JC","SK","DP","ML"].map((init, idx) => (
                    <MenteeInitial key={idx}>{init}</MenteeInitial>
                  ))}
                </MenteeList>
              </MenteesSection>
              <CardActions>
                <ManageBtn onClick={() => navigate(`/dashboard/${role}/course/${encodeURIComponent(c.title)}`)}>⚙️ Manage</ManageBtn>
                <AssignBtn onClick={() => navigate(`/dashboard/${role}/assignments?course=${encodeURIComponent(c.title)}`)}>
                  📝 Assignments
                </AssignBtn>
              </CardActions>
            </Card>
          ) : (
            <Card key={i} data-aos="fade-up" data-aos-delay={i * 50}>
              <CardImage>
                {c.emoji}
                {enrolledCourses[c.title] && <span style={{ position: "absolute", top: 12, right: 12, background: "#b50064", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "4px 10px", borderRadius: "50px" }}>Active</span>}
              </CardImage>
              <Badge>{c.badge}</Badge>
              <CardTitle>{c.title}</CardTitle>
              <CardDesc>{c.desc}</CardDesc>
              {enrolledCourses[c.title] && (
                <>
                  <ProgressRow>
                    <span style={{ color: "#006590", fontWeight: 600 }}>{enrolledCourses[c.title].progress}% Complete</span>
                    <AssignmentCount>{c.assignments} assignment{c.assignments > 1 ? "s" : ""}</AssignmentCount>
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
                  <p>{selected.lessons} lessons</p>
                  <p>Course content</p>
                </MetaBox>
                <MetaBox>
                  <p>📝</p>
                  <p>{selected.assignments}</p>
                  <p>Assignments</p>
                </MetaBox>
              </MetaGrid>

              <SyllabusSection>
                <SyllabusTitle>Course Syllabus</SyllabusTitle>
                {selected.syllabus.map((topic, i) => (
                  <SyllabusItem key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{topic}</p>
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
                  ▶ Continue — {selected.syllabus[enrolledCourses[selected.title].lastTopic || 0]}
                </ContinueBtn>
              ) : (
                <StartBtn onClick={() => { enrollCourse(selected.title); setSelected(null); navigate(`/dashboard/${role}/course/${encodeURIComponent(selected.title)}`); }}>
                  🚀 Start Course — {selected.syllabus[0]}
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
                <FormInput placeholder="e.g. Advanced UI/UX Systems" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea placeholder="Describe the program..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormSelect value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>
                  <option>Design</option>
                  <option>Engineering</option>
                  <option>Business</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {["🎨", "📊", "💡", "⚛️", "🚀", "✨"].map((e) => (
                    <EmojiOption key={e} $selected={form.emoji === e} onClick={() => setForm({ ...form, emoji: e })}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>

              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Duration (weeks)</FormLabel>
                  <FormInput type="number" placeholder="e.g. 8" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </FormSelect>
                </FormGroup>
              </div>

              <CreateProgramBtn onClick={handleCreate}>
                ✨ Create Program
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
                <FormInput value={editTarget.title} onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea value={editTarget.desc} onChange={(e) => setEditTarget({ ...editTarget, desc: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormSelect value={editTarget.badge} onChange={(e) => setEditTarget({ ...editTarget, badge: e.target.value })}>
                  <option>Design</option>
                  <option>Engineering</option>
                  <option>Business</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {["🎨", "📊", "💡", "⚛️", "🚀", "✨"].map((e) => (
                    <EmojiOption key={e} $selected={editTarget.emoji === e} onClick={() => setEditTarget({ ...editTarget, emoji: e })}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <FormGroup style={{ flex: 1 }}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect value={editTarget.level} onChange={(e) => setEditTarget({ ...editTarget, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </FormSelect>
                </FormGroup>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <CreateProgramBtn onClick={saveEdit} style={{ flex: 1 }}>💾 Save Changes</CreateProgramBtn>
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
                <CreateProgramBtn onClick={doDelete} style={{ flex: 1, background: "#e53935" }}>Yes, Delete</CreateProgramBtn>
                <CreateProgramBtn onClick={() => setDeleteTarget(null)} style={{ flex: 1, background: "#e0e0e0", color: "#333" }}>Cancel</CreateProgramBtn>
              </div>
            </ModalBody>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
};
