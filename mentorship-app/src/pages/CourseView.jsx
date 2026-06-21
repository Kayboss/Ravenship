import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getCourse, getCourses, updateCourse, deleteCourse as deleteCourseFromDb } from "../firebase/db";

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

const BackLink = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.2s;
  &:hover { color: ${(props) => props.theme.colors.primary}; background: ${(props) => props.theme.colors.surface}; }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: 1fr;
  }
`;

const SidebarNav = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  padding: 16px;
  position: sticky;
  top: 24px;
`;

const SidebarTitle = styled.p`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
  padding: 8px 12px;
  margin-bottom: 8px;
`;

const TopicItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: ${(props) => props.$active ? props.theme.colors.primary + "12" : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: ${(props) => props.$active ? 700 : 500};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.primary}08; color: ${(props) => props.theme.colors.primary}; }
`;

const TopicNum = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${(props) => props.$active ? "white" : props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  padding: 40px;
  min-height: 60vh;
`;

const TopicHeader = styled.div`
  margin-bottom: 24px;
`;

const TopicLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const TopicTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const TopicDesc = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  height: 340px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary}10, ${(props) => props.theme.colors.secondary}10);
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: ${(props) => props.theme.colors.textSecondary}40;
  border: 1px solid ${(props) => props.theme.colors.outline};
`;

const LessonContent = styled.div`
  h4 {
    font-weight: 700;
    color: ${(props) => props.theme.colors.textPrimary};
    margin: 20px 0 10px;
    font-size: 1.1rem;
  }
  p {
    color: ${(props) => props.theme.colors.textSecondary};
    line-height: 1.7;
    margin-bottom: 12px;
    font-size: 0.92rem;
  }
  ul {
    color: ${(props) => props.theme.colors.textSecondary};
    padding-left: 20px;
    margin-bottom: 16px;
    li { margin-bottom: 8px; line-height: 1.6; font-size: 0.92rem; }
  }
`;

const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${(props) => props.theme.colors.outline}50;
`;

const NavBtn = styled.button`
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.$primary ? props.theme.colors.primary : props.theme.colors.background};
  color: ${(props) => props.$primary ? "white" : props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ProgressTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 6px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 50px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$w}%;
  background: ${(props) => props.theme.colors.primary};
  border-radius: 50px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

const courseContent = {};

const fallbackLesson = {
  desc: "Begin your learning journey with an introduction to the course.",
  video: "🎬",
  sections: [
    { type: "text", content: "Welcome to the course! This is the first lesson where you will get an overview of what to expect." },
    { type: "list", items: ["Course overview and structure", "Setting up your learning environment", "Resources and references"] },
  ],
};

const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

export const CourseView = () => {
  const { role, title } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses, updateProgress } = useCourses();
  const courseName = decodeURIComponent(title);
  const isMentor = role === "mentor";
  const storageKey = `courseData_${courseName}`;

  const loadSavedCourseData = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    const base = courseContent[courseName] || { emoji: "📚", color: "#006590", resources: [], lessons: { "Introduction": { desc: "Begin your learning journey.", video: "🎬", videoUrl: "", sections: [{ type: "text", content: "Welcome to the course!" }, { type: "list", items: ["Overview", "Setup"] }] } } };
    return { ...base, featuredImage: base.featuredImage || "", resources: base.resources || [], lessons: Object.fromEntries(Object.entries(base.lessons).map(([k, v]) => [k, { ...v, videoUrl: v.videoUrl || "" }])) };
  };

  const [courseData, setCourseData] = useState(loadSavedCourseData);
  const [courseTitle, setCourseTitle] = useState(() => { const s = loadSavedCourseData(); return s._title || courseName; });
  const [editCourse, setEditCourse] = useState({ title: courseName, desc: "", badge: "Design", level: "Intermediate", emoji: courseData.emoji });
  const [firestoreCourseId, setFirestoreCourseId] = useState(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [resTitle, setResTitle] = useState("");
  const [resValue, setResValue] = useState("");
  const [resType, setResType] = useState("link");
  const [editMode, setEditMode] = useState(false);
  const topicKeys = Object.keys(courseData.lessons);
  const savedOnceRef = useRef(false);

  const getSavedTopic = () => {
    try { const saved = localStorage.getItem(`lastTopic_${courseName}`); if (saved && topicKeys.includes(saved)) return saved; } catch {}
    return topicKeys[0];
  };
  const [activeTopic, setActiveTopic] = useState(getSavedTopic);
  const getCompleted = () => {
    try { const c = localStorage.getItem(`completed_${courseName}`); return c ? JSON.parse(c) : []; } catch { return []; }
  };
  const [completedLessons, setCompletedLessons] = useState(getCompleted);

  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  useEffect(() => {
    const lsId = localStorage.getItem("fs_courseId_" + courseName);
    if (lsId) {
      setFirestoreCourseId(lsId);
      getCourse(lsId).then(fs => { if (fs?.featuredImage) setCourseData(prev => ({ ...prev, featuredImage: fs.featuredImage })); }).catch(() => {});
      return;
    }
    getCourses().then(courses => {
      const match = courses.find(c => c.title === courseName || c.title === courseTitle);
      if (match) {
        setFirestoreCourseId(match.id);
        localStorage.setItem("fs_courseId_" + courseName, match.id);
        if (match.featuredImage) setCourseData(prev => ({ ...prev, featuredImage: match.featuredImage }));
      }
    }).catch(() => {});
  }, [courseName, courseTitle]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ ...courseData, _title: courseTitle }));
  }, [courseData, courseTitle, storageKey]);

  useEffect(() => {
    if (!editMode && firestoreCourseId && savedOnceRef.current) {
      updateCourse(firestoreCourseId, { _title: courseTitle, lessons: courseData.lessons, resources: courseData.resources, emoji: courseData.emoji, color: courseData.color, featuredImage: courseData.featuredImage }).catch(() => {});
    }
    if (!editMode) savedOnceRef.current = true;
  }, [editMode, firestoreCourseId]);

  useEffect(() => {
    if (!isMentor) localStorage.setItem(`lastTopic_${courseName}`, activeTopic);
  }, [activeTopic, courseName, isMentor]);

  useEffect(() => {
    localStorage.setItem(`completed_${courseName}`, JSON.stringify(completedLessons));
  }, [completedLessons, courseName]);

  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    if (!isMentor) {
      const idx = topicKeys.indexOf(topic);
      updateProgress(courseName, idx, topicKeys.length);
    }
  };

  const lesson = courseData.lessons[activeTopic];
  const currentIdx = topicKeys.indexOf(activeTopic);
  const progress = ((currentIdx + 1) / topicKeys.length) * 100;

  // --- Mentor editing functions ---

  const updateLessonField = (key, value) => {
    setCourseData(prev => ({
      ...prev,
      lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], [key]: value } },
    }));
  };

  const updateSectionItem = (sectionIdx, field, value) => {
    setCourseData(prev => {
      const sections = [...prev.lessons[activeTopic].sections];
      sections[sectionIdx] = { ...sections[sectionIdx], [field]: value };
      return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } };
    });
  };

  const addListItem = (sectionIdx) => {
    setCourseData(prev => {
      const sections = [...prev.lessons[activeTopic].sections];
      const items = [...(sections[sectionIdx].items || []), "New item"];
      sections[sectionIdx] = { ...sections[sectionIdx], items };
      return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } };
    });
  };

  const updateListItem = (sectionIdx, itemIdx, value) => {
    setCourseData(prev => {
      const sections = [...prev.lessons[activeTopic].sections];
      const items = [...sections[sectionIdx].items];
      items[itemIdx] = value;
      sections[sectionIdx] = { ...sections[sectionIdx], items };
      return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } };
    });
  };

  const removeListItem = (sectionIdx, itemIdx) => {
    setCourseData(prev => {
      const sections = [...prev.lessons[activeTopic].sections];
      const items = sections[sectionIdx].items.filter((_, i) => i !== itemIdx);
      sections[sectionIdx] = { ...sections[sectionIdx], items };
      return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } };
    });
  };

  const addNewTopic = () => {
    if (!newTopicName.trim()) return;
    if (courseData.lessons[newTopicName.trim()]) return alert("Topic already exists");
    setCourseData(prev => ({
      ...prev,
      lessons: { ...prev.lessons, [newTopicName.trim()]: { desc: "New lesson description", video: "🎬", sections: [{ type: "text", content: "Lesson content goes here." }, { type: "list", items: ["Key point 1", "Key point 2"] }] } },
    }));
    setActiveTopic(newTopicName.trim());
    setNewTopicName("");
  };

  const deleteTopic = (topic) => {
    if (topicKeys.length <= 1) return alert("A course must have at least one topic");
    setCourseData(prev => {
      const lessons = { ...prev.lessons };
      delete lessons[topic];
      return { ...prev, lessons };
    });
    setActiveTopic(topicKeys.filter(t => t !== topic)[0]);
  };

  const deleteCourse = () => {
    if (confirm(`Are you sure you want to delete "${courseName}"? This cannot be undone.`)) {
      localStorage.removeItem(storageKey);
      if (firestoreCourseId) {
        deleteCourseFromDb(firestoreCourseId).catch(() => {});
      }
      navigate(`/dashboard/${role}/my-courses`);
    }
  };

  if (!isMentor) {
    return (
      <Page>
<SidebarByRole />
        <Main>
          <TopBar searchPlaceholder="Search lessons..." />
          <BackLink onClick={() => navigate(`/dashboard/${role}/my-courses`)}>← Back to My Courses</BackLink>
          {courseData.featuredImage && (
            <img src={courseData.featuredImage} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 20, marginBottom: 20, display: "block" }} />
          )}
          <ProgressTop>
            <span style={{ fontWeight: 700, color: courseData.color, fontSize: "0.85rem" }}>{courseName}</span>
            <ProgressTrack><ProgressFill $w={progress} /></ProgressTrack>
            <ProgressText>{currentIdx + 1} / {topicKeys.length}</ProgressText>
          </ProgressTop>
          <Layout>
            <SidebarNav>
              <SidebarTitle>Course Syllabus</SidebarTitle>
              {topicKeys.map((topic, i) => (
                <TopicItem key={topic} $active={topic === activeTopic} onClick={() => handleTopicChange(topic)}>
                  <TopicNum $active={topic === activeTopic}>{String(i + 1).padStart(2, "0")}</TopicNum>
                  {topic}
                </TopicItem>
              ))}
              {courseData.resources?.length > 0 && (
                <>
                  <SidebarTitle style={{ marginTop: 20 }}>📁 Resources</SidebarTitle>
                  {courseData.resources.map((r, i) => (
                    <TopicItem key={i} onClick={() => { if (r.type === "link") window.open(r.value, "_blank"); }} style={{ cursor: r.type === "link" ? "pointer" : "default" }}>
                      <span style={{ fontSize: "1rem" }}>{r.type === "link" ? "🔗" : "📄"}</span>
                      <span style={{ fontSize: "0.8rem" }}>{r.title}</span>
                    </TopicItem>
                  ))}
                </>
              )}
            </SidebarNav>
            <ContentArea key={activeTopic} data-aos="fade-up">
              <TopicHeader>
                <TopicLabel>Lesson {String(currentIdx + 1).padStart(2, "0")}</TopicLabel>
                <TopicTitle>{activeTopic}</TopicTitle>
                <TopicDesc>{lesson.desc}</TopicDesc>
              </TopicHeader>
              {(() => { const embed = getVideoEmbedUrl(lesson.videoUrl); return embed ? <iframe src={embed} title="Lesson Video" style={{ width: "100%", height: 340, borderRadius: 16, margin: "24px 0", border: "none" }} allowFullScreen /> : <VideoPlaceholder>🎬 Lesson Video</VideoPlaceholder>; })()}
              <LessonContent>
                {lesson.sections.map((s, i) =>
                  s.type === "text" ? <p key={i}>{s.content}</p> : <ul key={i}>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                )}
              </LessonContent>
              <div style={{ textAlign: "center", margin: "24px 0" }}>
                {completedLessons.includes(activeTopic) ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 50, background: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: "0.9rem" }}>
                    ✅ Completed
                  </span>
                ) : (
                  <button onClick={() => {
                    setCompletedLessons(prev => [...prev, activeTopic]);
                    if (currentIdx < topicKeys.length - 1) {
                      setTimeout(() => handleTopicChange(topicKeys[currentIdx + 1]), 400);
                    }
                  }}
                    style={{ padding: "10px 28px", borderRadius: 50, border: "2px solid #2e7d32", background: "transparent", color: "#2e7d32", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                    ✓ Mark as Complete
                  </button>
                )}
              </div>
              <NavRow>
                <NavBtn disabled={currentIdx === 0} onClick={() => handleTopicChange(topicKeys[currentIdx - 1])}>← Previous</NavBtn>
                <NavBtn $primary disabled={currentIdx === topicKeys.length - 1} onClick={() => handleTopicChange(topicKeys[currentIdx + 1])}>Next Lesson →</NavBtn>
              </NavRow>
            </ContentArea>
          </Layout>
        </Main>
      </Page>
    );
  }

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search lessons..." />
        <BackLink onClick={() => navigate(`/dashboard/${role}/my-courses`)}>← Back to My Programs</BackLink>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: "2rem", marginRight: 12 }}>{courseData.emoji}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2c3e50" }}>{courseTitle}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <NavBtn $primary onClick={() => setEditMode(!editMode)}>{editMode ? "✓ Done Editing" : "✏️ Edit Course"}</NavBtn>
            <NavBtn style={{ background: "#e53935", color: "white" }} onClick={deleteCourse}>🗑 Delete Course</NavBtn>
          </div>
        </div>

        {courseData.featuredImage && (
          <img src={courseData.featuredImage} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 20, marginBottom: 24, display: "block" }} />
        )}

        {editMode && (
          <>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e0e0e0", padding: 24, marginBottom: 24 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16, color: "#2c3e50" }}>Course Settings</h4>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#333" }}>Course Title</label>
              <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#333" }}>Featured Image</label>
              {courseData.featuredImage && (
                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                  <img src={courseData.featuredImage} alt="Featured" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, display: "block" }} />
                  <button onClick={() => setCourseData(prev => ({ ...prev, featuredImage: "" }))}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => setCourseData(prev => ({ ...prev, featuredImage: ev.target.result })); reader.readAsDataURL(file); } }}
                style={{ fontSize: "0.85rem", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#333" }}>Emoji</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["🎨", "📊", "💡", "⚛️", "🚀", "✨"].map(e => (
                    <button key={e} onClick={() => setCourseData(prev => ({ ...prev, emoji: e }))}
                      style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${courseData.emoji === e ? "#b50064" : "#e0e0e0"}`, background: courseData.emoji === e ? "#b5006415" : "transparent", cursor: "pointer", fontSize: "1.2rem" }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#333" }}>Accent Color</label>
                <select value={courseData.color} onChange={(e) => setCourseData(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.9rem" }}>
                  <option value="#b50064">Pink</option>
                  <option value="#006590">Teal</option>
                  <option value="#ffd200">Yellow</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e0e0e0", padding: 24, marginBottom: 24 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16, color: "#2c3e50" }}>📁 Resources</h4>
            {courseData.resources.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f9f9f9", borderRadius: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: 2 }}>{r.title}</strong>
                  <span style={{ fontSize: "0.78rem", color: "#594048" }}>{r.type === "link" ? "🔗" : "📄"} {r.type === "link" ? r.value : r.value?.slice(0, 40) + "..."}</span>
                </div>
                <button onClick={() => setCourseData(prev => ({ ...prev, resources: prev.resources.filter((_, j) => j !== i) }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "0.8rem" }}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input id="resTitle" placeholder="Resource title..." value={resTitle} onChange={e => setResTitle(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.85rem" }} />
              <input id="resValue" placeholder={resType === "link" ? "https://..." : "File path..."} value={resValue} onChange={e => setResValue(e.target.value)}
                style={{ flex: 2, padding: "8px 12px", borderRadius: 10, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.85rem" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <select value={resType} onChange={e => setResType(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.85rem", background: "#fff" }}>
                <option value="link">🔗 Link</option>
                <option value="file">📄 Upload File</option>
              </select>
              {resType === "file" && (
                <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setResValue(ev.target.result); r.readAsDataURL(f); } }}
                  style={{ fontSize: "0.85rem", fontFamily: "inherit" }} />
              )}
              <button onClick={() => { if (!resTitle.trim() || !resValue.trim()) return alert("Title and value required"); setCourseData(prev => ({ ...prev, resources: [...prev.resources, { title: resTitle.trim(), type: resType, value: resValue }] })); setResTitle(""); setResValue(""); }}
                style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#006590", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>Add</button>
            </div>
          </div>
        </>)}
        
        <Layout>
          <SidebarNav>
            <SidebarTitle>Course Syllabus</SidebarTitle>
            {topicKeys.map((topic, i) => (
              <div key={topic} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <TopicItem $active={topic === activeTopic} onClick={() => setActiveTopic(topic)} style={{ flex: 1 }}>
                  <TopicNum $active={topic === activeTopic}>{String(i + 1).padStart(2, "0")}</TopicNum>
                  {topic}
                </TopicItem>
                {editMode && (
                  <button onClick={() => deleteTopic(topic)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "0.8rem", padding: "4px" }}>✕</button>
                )}
              </div>
            ))}
            {editMode && (
              <div style={{ display: "flex", gap: 4, marginTop: 8, padding: "0 4px" }}>
                <input value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="New topic..."
                  style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.8rem" }} />
                <button onClick={addNewTopic} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#b50064", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>+</button>
              </div>
            )}
            {courseData.resources?.length > 0 && (
              <>
                <SidebarTitle style={{ marginTop: 20 }}>📁 Resources</SidebarTitle>
                {courseData.resources.map((r, i) => (
                  <TopicItem key={i} onClick={() => { if (r.type === "link") window.open(r.value, "_blank"); }} style={{ cursor: r.type === "link" ? "pointer" : "default" }}>
                    <span style={{ fontSize: "1rem" }}>{r.type === "link" ? "🔗" : "📄"}</span>
                    <span style={{ fontSize: "0.8rem" }}>{r.title}</span>
                  </TopicItem>
                ))}
              </>
            )}
          </SidebarNav>

          <ContentArea key={activeTopic} data-aos="fade-up">
            <TopicHeader>
              <TopicLabel>Lesson {String(currentIdx + 1).padStart(2, "0")}</TopicLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <TopicTitle>{activeTopic}</TopicTitle>
                {editMode && (
                  <button onClick={() => { const newName = prompt("Rename topic:", activeTopic); if (newName && newName.trim() && newName !== activeTopic) { setCourseData(prev => { const lessons = { ...prev.lessons }; lessons[newName.trim()] = lessons[activeTopic]; delete lessons[activeTopic]; return { ...prev, lessons }; }); setActiveTopic(newName.trim()); } }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#006590", fontSize: "0.8rem", fontWeight: 600 }}>✏️ Rename</button>
                )}
              </div>
              {editMode ? (
                <input value={lesson.desc} onChange={(e) => updateLessonField("desc", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.95rem", color: "#594048", marginTop: 8 }} />
              ) : (
                <TopicDesc>{lesson.desc}</TopicDesc>
              )}
            </TopicHeader>

            {editMode ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#333" }}>Video URL (YouTube / Vimeo / direct link)</label>
                  <input value={lesson.videoUrl || ""} onChange={(e) => updateLessonField("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" }} />
                </div>
                <h4 style={{ fontWeight: 700, color: "#2c3e50", marginBottom: 12 }}>Lesson Content</h4>
                {lesson.sections.map((s, i) => (
                  <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#006590" }}>{s.type === "text" ? "📝 Text Section" : "📋 List Section"}</span>
                      <button onClick={() => { setCourseData(prev => { const sections = prev.lessons[activeTopic].sections.filter((_, j) => j !== i); return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } }; }) }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "0.8rem" }}>Remove</button>
                    </div>
                    {s.type === "text" ? (
                      <textarea value={s.content} onChange={(e) => updateSectionItem(i, "content", e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.9rem", minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
                    ) : (
                      <div>
                        {s.items.map((item, j) => (
                          <div key={j} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <span style={{ color: "#b50064" }}>•</span>
                            <input value={item} onChange={(e) => updateListItem(i, j, e.target.value)}
                              style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: "inherit", fontSize: "0.85rem" }} />
                            <button onClick={() => removeListItem(i, j)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "0.8rem" }}>✕</button>
                          </div>
                        ))}
                        <button onClick={() => addListItem(i)} style={{ marginTop: 6, padding: "4px 12px", borderRadius: 8, border: "1px solid #b50064", background: "transparent", color: "#b50064", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600 }}>+ Add Item</button>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setCourseData(prev => { const sections = [...prev.lessons[activeTopic].sections, { type: "text", content: "New section content." }]; return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } }; }) }}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #006590", background: "transparent", color: "#006590", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem" }}>+ Add Text Section</button>
                  <button onClick={() => { setCourseData(prev => { const sections = [...prev.lessons[activeTopic].sections, { type: "list", items: ["New item"] }]; return { ...prev, lessons: { ...prev.lessons, [activeTopic]: { ...prev.lessons[activeTopic], sections } } }; }) }}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #006590", background: "transparent", color: "#006590", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem" }}>+ Add List Section</button>
                </div>
              </div>
            ) : (
              <>
                {(() => { const embed = getVideoEmbedUrl(lesson.videoUrl); return embed ? <iframe src={embed} title="Lesson Video" style={{ width: "100%", height: 340, borderRadius: 16, margin: "24px 0", border: "none" }} allowFullScreen /> : <VideoPlaceholder>🎬 Lesson Video</VideoPlaceholder>; })()}
                <LessonContent>
                  {lesson.sections.map((s, i) =>
                    s.type === "text" ? <p key={i}>{s.content}</p> : <ul key={i}>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                  )}
                </LessonContent>
                <NavRow>
                  <NavBtn disabled={currentIdx === 0} onClick={() => handleTopicChange(topicKeys[currentIdx - 1])}>← Previous</NavBtn>
                  <NavBtn $primary disabled={currentIdx === topicKeys.length - 1} onClick={() => handleTopicChange(topicKeys[currentIdx + 1])}>Next Lesson →</NavBtn>
                </NavRow>
              </>
            )}
          </ContentArea>
        </Layout>
      </Main>
    </Page>
  );
};
