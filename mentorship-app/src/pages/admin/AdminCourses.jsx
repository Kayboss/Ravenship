import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { getCourses, getUsers, getAssignments, addCourse, updateCourse, deleteCourse, logActivity } from "../../firebase/db";
import { Badge, SectionBox, ModalOverlay, ModalBox, ModalTitle, Input, Textarea, Select, Btn } from "./adminStyles";

// ── Styled components matching MyCourses.jsx mentor card layout ──

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${p => p.theme.colors.outline};
  transition: all 0.3s;
  position: relative;
  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
`;

const CardImage = styled.div`
  height: 140px;
  border-radius: 16px;
  margin-bottom: 16px;
  background: ${p => `${p.theme.colors.primary}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  overflow: ${p => p.$hasImage ? "hidden" : "visible"};
`;

const CardBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => `${p.theme.colors.primary}10`};
  color: ${p => p.theme.colors.primary};
  margin-bottom: 8px;
`;

const CardTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: ${p => p.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 16px;
`;

const truncateWords = (text, max = 25) =>
  text?.split(" ").slice(0, max).join(" ") + (text?.split(" ").length > max ? "..." : "");

const MentorStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const StatBox = styled.div`
  flex: 1;
  background: ${p => p.theme.colors.background};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  p:first-child { font-size: 1.3rem; font-weight: 700; color: ${p => p.theme.colors.textPrimary}; }
  p:last-child { font-size: 0.75rem; color: ${p => p.theme.colors.textSecondary}; }
`;

const MenteesSection = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${p => `${p.theme.colors.outline}40`};
  margin-bottom: 16px;
`;

const MenteeLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
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
  background: ${p => `${p.theme.colors.primary}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${p => p.theme.colors.primary};
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${p => `${p.theme.colors.outline}40`};
`;

const EditBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: 2px solid ${p => p.theme.colors.primary};
  background: transparent;
  color: ${p => p.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.theme.colors.primary}; color: #fff; }
`;

const ManageBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: ${p => p.theme.colors.primary};
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

const AssignBtn = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  background: transparent;
  color: ${p => p.theme.colors.textPrimary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { background: ${p => `${p.theme.colors.primary}10`}; border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
`;

const CreateNewCard = styled.div`
  border-radius: 24px;
  border: 2px dashed ${p => p.theme.colors.outline};
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
    border-color: ${p => p.theme.colors.primary};
    background: ${p => p.theme.colors.surface};
  }
`;

const CreateIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${p => p.theme.colors.primaryContainer};
  transition: transform 0.3s;
  ${CreateNewCard}:hover & { transform: scale(1.1); }
`;

const CreateText = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textPrimary};
`;

const CreateSubtext = styled.p`
  font-size: 0.8rem;
  color: ${p => p.theme.colors.textSecondary};
`;

// ── Modal form components matching MyCourses.jsx ──

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Modal = styled.div`
  background: ${p => p.theme.colors.surface};
  border-radius: 28px;
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  height: 160px;
  border-radius: 28px 28px 0 0;
  background: linear-gradient(135deg, ${p => p.$color || p.theme.colors.primary}, ${p => p.theme.colors.secondary});
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
  background: rgba(0,0,0,0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(0,0,0,0.4); }
`;

const ModalBody = styled.div`
  padding: 28px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textPrimary};
  margin-bottom: 6px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${p => p.theme.colors.primary}; }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  &:focus { border-color: ${p => p.theme.colors.primary}; }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.colors.primary}; }
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
  border: 2px solid ${p => p.$selected ? p.theme.colors.primary : p.theme.colors.outline};
  background: ${p => p.$selected ? `${p.theme.colors.primary}15` : p.theme.colors.background};
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover { border-color: ${p => p.theme.colors.primary}; }
`;

const CreateProgramBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: ${p => p.theme.colors.primary};
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const RedBtn = styled(CreateProgramBtn)`
  background: #e53935;
`;

const emojis = ["🎨", "📊", "💡", "⚛️", "🚀", "✨"];

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [enrollmentMap, setEnrollmentMap] = useState([]);
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const [form, setForm] = useState({ title:"", desc:"", badge:"Design", emoji:"🎨", duration:"", level:"Beginner", featuredImage:"", mentorId:"" });

  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  const loadData = () => {
    Promise.all([
      getCourses().then(d => {
        const arr = Array.isArray(d) ? d : [];
        setCourses(arr.map(c => {
          const topics = Array.isArray(c.syllabus) && c.syllabus.length > 0
            ? c.syllabus
            : (typeof c.lessonContent === 'object' && c.lessonContent !== null ? Object.keys(c.lessonContent) : []);
          return { ...c, syllabus: topics, enrolledMentees: c.enrolledMentees || [] };
        }));
      }),
      getUsers().then(d => {
        const users = Array.isArray(d) ? d : [];
        setMentors(users.filter(u => u.role === "mentor" && !u.deleted));
        setUserMap(Object.fromEntries(users.map(u => [u.id, u])));
      }),
      getDocs(collection(db, "enrollments")).then(snap => {
        setEnrollmentMap(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }),
      getAssignments().then(d => {
        const counts = {};
        (d || []).forEach(a => { if (a.course) counts[a.course] = (counts[a.course] || 0) + 1; });
        setAssignmentCounts(counts);
      })
    ]).catch(e => console.error("load error:", e));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.desc.trim() || !form.duration.trim() || !form.mentorId) {
      alert("Please fill in all fields and select a mentor");
      return;
    }
    const mentor = mentors.find(m => m.id === form.mentorId);
    if (!mentor) { alert("Selected mentor not found"); return; }
    setSaving(true);
    const newCourse = {
      title: form.title,
      desc: form.desc,
      fullDesc: form.desc,
      badge: form.badge,
      emoji: form.emoji,
      featuredImage: form.featuredImage || "",
      instructor: mentor.name,
      role: "Mentor",
      createdBy: mentor.id,
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
      setCourses(prev => [{ ...newCourse, id, enrolledMentees: [], syllabus: [] }, ...prev]);
      logActivity("Admin created course", { detail: `Course "${form.title}" created for mentor ${mentor.name}` });
      alert("Course created!");
    } catch { alert("Failed to save course."); }
    setShowCreate(false);
    setForm({ title:"", desc:"", badge:"Design", emoji:"🎨", duration:"", level:"Beginner", featuredImage:"", mentorId:"" });
    setSaving(false);
  };

  const handleEdit = (course) => {
    setEditTarget({ ...course, _mentorId: course.createdBy || "" });
  };

  const saveEdit = async () => {
    if (!editTarget.title.trim()) return alert("Title is required");
    const mentor = mentors.find(m => m.id === editTarget._mentorId);
    if (!mentor) { alert("Selected mentor not found"); return; }
    setSaving(true);
    const updated = {
      title: editTarget.title,
      desc: editTarget.desc,
      fullDesc: editTarget.desc,
      badge: editTarget.badge,
      emoji: editTarget.emoji,
      featuredImage: editTarget.featuredImage || "",
      instructor: mentor.name,
      createdBy: mentor.id,
      level: editTarget.level,
      duration: editTarget.duration,
    };
    if (editTarget.id) {
      try { await updateCourse(editTarget.id, updated); } catch { alert("Failed to save changes."); setSaving(false); return; }
    }
    setCourses(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...updated, syllabus: c.syllabus } : c));
    setEditTarget(null);
    setSaving(false);
    alert("Course updated!");
  };

  const confirmDelete = (course) => {
    const fromArray = (course.enrolledMentees || []).length;
    const fromEnrollments = enrollmentMap.filter(e => e.courseTitle === course.title).length;
    const count = Math.max(fromArray, fromEnrollments);
    if (count > 0) { alert(`Cannot delete "${course.title}" — ${count} mentee(s) are enrolled.`); return; }
    setDeleteTarget(course);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteCourse(deleteTarget.id);
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
      logActivity("Admin deleted course", { detail: `Course "${deleteTarget.title}" deleted` });
    } catch { alert("Failed to delete course."); }
    setDeleteTarget(null);
    setSaving(false);
  };

  const resetForm = () => setForm({ title:"", desc:"", badge:"Design", emoji:"🎨", duration:"", level:"Beginner", featuredImage:"", mentorId:"" });

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{margin:0,fontSize:"1.2rem",fontWeight:700,color:"#2c3e50"}}>All Courses ({courses.length})</h3>
      </div>

      <Grid>
        {courses.map((c, i) => {
          const fromArray = c.enrolledMentees || [];
          const fromEnrollments = enrollmentMap.filter(e => e.courseTitle === c.title).map(e => e.userId);
          const allIds = [...new Set([...fromArray, ...fromEnrollments])];
          const count = allIds.length;
          const initials = allIds.map(id => {
            const u = userMap[id];
            return u?.name ? u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : null;
          }).filter(Boolean);
          return (
          <Card key={c.id || i} data-aos="fade-up" data-aos-delay={i * 50}>
            <CardImage $hasImage={!!c.featuredImage}>
              {c.featuredImage ? <img src={c.featuredImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16,position:"absolute",inset:0}} /> : c.emoji}
            </CardImage>
            <CardBadge>{c.badge}</CardBadge>
            <CardTitle>{c.title}</CardTitle>
            <CardDesc>{truncateWords(c.desc)}</CardDesc>
            <MentorStats>
              <StatBox>
                <p>{count}</p>
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
                {initials.slice(0, 5).map((init, idx) => (
                  <MenteeInitial key={idx}>{init}</MenteeInitial>
                ))}
                {count > 5 && (
                  <MenteeInitial style={{background:"#594048"}}>+{count - 5}</MenteeInitial>
                )}
              </MenteeList>
            </MenteesSection>
            <CardActions>
              <EditBtn onClick={() => handleEdit(c)}>✏️ Edit</EditBtn>
              <ManageBtn onClick={() => navigate(`/dashboard/admin/course/${encodeURIComponent(c.title)}`)}>⚙️ Manage</ManageBtn>
            </CardActions>
            <AssignBtn onClick={() => navigate(`/dashboard/admin/assignments?course=${encodeURIComponent(c.title)}`)}>
              📝 Assignments
            </AssignBtn>
          </Card>
        );})}
        <CreateNewCard onClick={() => { resetForm(); setShowCreate(true); }} data-aos="fade-up">
          <CreateIcon>+</CreateIcon>
          <CreateText>+ Create New Program</CreateText>
          <CreateSubtext>Assign to a mentor</CreateSubtext>
        </CreateNewCard>
      </Grid>

      {showCreate && (
        <Overlay onClick={() => setShowCreate(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <span style={{ fontSize: "3rem" }}>{form.emoji}</span>
              <CloseBtn onClick={() => setShowCreate(false)}>✕</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <FormLabel>Assign to Mentor</FormLabel>
                <FormSelect value={form.mentorId} onChange={e => setForm({...form, mentorId: e.target.value})}>
                  <option value="">— Select mentor —</option>
                  {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Program Title</FormLabel>
                <FormInput id="admin-course-title" name="title" placeholder="e.g. Advanced UI/UX Systems" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea id="admin-course-desc" name="description" placeholder="Describe the program..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormInput id="admin-course-badge" name="category" placeholder="e.g. Design, Engineering, Business" value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {emojis.map(e => (
                    <EmojiOption key={e} $selected={form.emoji === e} onClick={() => setForm({...form, emoji: e})}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>
              <FormGroup>
                <FormLabel>Featured Image</FormLabel>
                {form.featuredImage && (
                  <div style={{position:"relative",marginBottom:8,maxHeight:140,overflow:"hidden",borderRadius:12}}>
                    <img src={form.featuredImage} alt="" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:12,display:"block"}} />
                    <button onClick={() => setForm({...form, featuredImage: ""})}
                      style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",fontSize:"0.8rem"}}>✕</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => { const f=e.target.files?.[0]; if (!f) return; if (f.size > 500*1024) { alert("Image too large. Max 500KB."); return; } const r=new FileReader(); r.onload=ev => setForm({...form, featuredImage: ev.target.result}); r.readAsDataURL(f); }}
                  style={{fontSize:"0.85rem",fontFamily:"inherit"}} />
              </FormGroup>
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <FormGroup style={{flex:1}}>
                  <FormLabel>Duration (weeks)</FormLabel>
                  <FormInput id="admin-course-duration" name="duration" type="number" placeholder="e.g. 8" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
                </FormGroup>
                <FormGroup style={{flex:1}}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
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
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <span style={{fontSize:"3rem"}}>{editTarget.emoji}</span>
              <CloseBtn onClick={() => setEditTarget(null)}>✕</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <FormLabel>Assign to Mentor</FormLabel>
                <FormSelect value={editTarget._mentorId || ""} onChange={e => setEditTarget({...editTarget, _mentorId: e.target.value})}>
                  <option value="">— Select mentor —</option>
                  {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Program Title</FormLabel>
                <FormInput value={editTarget.title} onChange={e => setEditTarget({...editTarget, title: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea value={editTarget.desc || ""} onChange={e => setEditTarget({...editTarget, desc: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormInput value={editTarget.badge || ""} onChange={e => setEditTarget({...editTarget, badge: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Emoji</FormLabel>
                <EmojiGrid>
                  {emojis.map(e => (
                    <EmojiOption key={e} $selected={editTarget.emoji === e} onClick={() => setEditTarget({...editTarget, emoji: e})}>{e}</EmojiOption>
                  ))}
                </EmojiGrid>
              </FormGroup>
              <FormGroup>
                <FormLabel>Featured Image</FormLabel>
                {editTarget.featuredImage && (
                  <div style={{position:"relative",marginBottom:8,maxHeight:140,overflow:"hidden",borderRadius:12}}>
                    <img src={editTarget.featuredImage} alt="" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:12,display:"block"}} />
                    <button onClick={() => setEditTarget({...editTarget, featuredImage: ""})}
                      style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",fontSize:"0.8rem"}}>✕</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => { const f=e.target.files?.[0]; if (!f) return; if (f.size > 500*1024) { alert("Image too large."); return; } const r=new FileReader(); r.onload=ev => setEditTarget({...editTarget, featuredImage: ev.target.result}); r.readAsDataURL(f); }}
                  style={{fontSize:"0.85rem",fontFamily:"inherit"}} />
              </FormGroup>
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <FormGroup style={{flex:1}}>
                  <FormLabel>Level</FormLabel>
                  <FormSelect value={editTarget.level || "Beginner"} onChange={e => setEditTarget({...editTarget, level: e.target.value})}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </FormSelect>
                </FormGroup>
              </div>
              <div style={{display:"flex",gap:12}}>
                <CreateProgramBtn onClick={saveEdit} disabled={saving} style={{flex:1}}>
                  {saving ? "⏳ Saving..." : "💾 Save Changes"}
                </CreateProgramBtn>
                <CreateProgramBtn onClick={() => setEditTarget(null)} style={{flex:1,background:"#e0e0e0",color:"#333"}}>Cancel</CreateProgramBtn>
              </div>
            </ModalBody>
          </Modal>
        </Overlay>
      )}

      {deleteTarget && (
        <Overlay onClick={() => setDeleteTarget(null)}>
          <Modal onClick={e => e.stopPropagation()} style={{maxWidth:400}}>
            <ModalBody style={{textAlign:"center"}}>
              <div style={{fontSize:"3rem",marginBottom:16}}>🗑</div>
              <h3 style={{fontWeight:700,fontSize:"1.1rem",color:"#2c3e50",marginBottom:12}}>Delete Course?</h3>
              <p style={{color:"#594048",marginBottom:24,fontSize:"0.9rem"}}>Are you sure you want to delete "{deleteTarget.title}"? This cannot be undone.</p>
              <div style={{display:"flex",gap:12}}>
                <RedBtn onClick={doDelete} disabled={saving} style={{flex:1}}>
                  {saving ? "⏳ Deleting..." : "Yes, Delete"}
                </RedBtn>
                <CreateProgramBtn onClick={() => setDeleteTarget(null)} style={{flex:1,background:"#e0e0e0",color:"#333"}}>Cancel</CreateProgramBtn>
              </div>
            </ModalBody>
          </Modal>
        </Overlay>
      )}
    </>
  );
}