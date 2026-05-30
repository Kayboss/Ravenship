import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser } from "../firebase/auth";
import { updateUser } from "../firebase/db";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadProfilePic, deleteProfilePic } from "../firebase/storage";

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
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 28px 32px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  ${(props) => props.$span2 && "grid-column: 1 / -1;"}
`;

const CardTitle = styled.h3`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 16px;
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
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  background: ${(props) => props.theme.colors.primary}15;
  color: ${(props) => props.theme.colors.primary};
  text-transform: capitalize;
`;

const PhotoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const PhotoPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${(props) => props.theme.colors.outline};
  overflow: hidden;
  background: ${(props) => props.theme.colors.primaryContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const PhotoBtn = styled.label`
  padding: 10px 20px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const PhotoHint = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 6px;
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AddRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  input { flex: 1; }
`;

const AddBtn = styled.button`
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.secondary};
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const RemoveTag = styled.span`
  margin-left: 6px;
  cursor: pointer;
  opacity: 0.5;
  &:hover { opacity: 1; }
`;

const Tag = styled.button`
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.outline};
  background: ${(props) => props.$active ? props.theme.colors.primary + "15" : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const SaveBtn = styled.button`
  padding: 12px 32px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const SuccessMsg = styled.div`
  padding: 12px 20px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.success}20;
  color: ${(props) => props.theme.colors.success};
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 16px;
  grid-column: 1 / -1;
`;

const interestOptions = [
  "UI/UX Design", "Web Development", "Mobile Apps", "Data Science",
  "Product Management", "Brand Strategy", "Graphic Design", "Machine Learning",
  "Frontend Engineering", "Backend Engineering", "DevOps", "Digital Marketing",
];

const skillOptions = [
  "Figma", "React", "TypeScript", "JavaScript", "Python", "SQL",
  "Node.js", "Tailwind CSS", "Adobe XD", "Sketch", "Firebase",
  "AWS", "Docker", "GraphQL", "Next.js", "Vue.js",
];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("en-US", { month: "long" })
);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export const Settings = () => {
  const { role } = useParams();
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return getStoredUser() || {};
    } catch { return {}; }
  });

  const settings = JSON.parse(localStorage.getItem("settings") || "{}");

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [dobMonth, setDobMonth] = useState(settings.dobMonth || "");
  const [dobDay, setDobDay] = useState(settings.dobDay || "");
  const [dobYear, setDobYear] = useState(settings.dobYear || "");
  const [interests, setInterests] = useState(settings.interests || []);
  const [skills, setSkills] = useState(settings.skills || []);
  const [photo, setPhoto] = useState(settings.photo || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [bio, setBio] = useState(settings.bio || "");
  const [saving, setSaving] = useState(false);

  let userEmail = "default";
  try { const u = getStoredUser(); if (u?.email) userEmail = u.email; } catch {}
  const notifKey = `notifPrefs_${userEmail}`;
  const loadNotifs = () => {
    try { const d = localStorage.getItem(notifKey); if (d) return JSON.parse(d); } catch {}
    return role === "mentor"
      ? { newSubmission: true, courseCompleted: true, assignmentGraded: true, menteeEnrolled: true, pendingReview: true }
      : { assignmentGraded: true, courseCompleted: true, newMessage: true, submissionReviewed: true, dailyReminder: true };
  };
  const [notifPrefs, setNotifPrefs] = useState(loadNotifs);
  const toggleNotif = (key) => {
    setNotifPrefs(prev => { const n = { ...prev, [key]: !prev[key] }; localStorage.setItem(notifKey, JSON.stringify(n)); return n; });
  };

  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleSkill = (item) => {
    setSkills((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomInterest = () => {
    const val = customInterest.trim();
    if (val && !interests.includes(val)) {
      setInterests((prev) => [...prev, val]);
      setCustomInterest("");
    }
  };

  const addCustomSkill = () => {
    const val = customSkill.trim();
    if (val && !skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
      setCustomSkill("");
    }
  };

  const [photoFile, setPhotoFile] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (currentPw || newPw || confirmPw) {
      if (newPw !== confirmPw) { setSaving(false); alert("Passwords do not match."); return; }
      if (newPw.length < 8) { setSaving(false); alert("Password must be at least 8 characters."); return; }
    }

    try {
      const user = getStoredUser();
      let photoURL = photo;
      if (photoFile) {
        photoURL = await uploadProfilePic(user.id, photoFile);
        setPhotoFile(null);
      }
      await updateUser(user.id, { name, phone, city, bio, photoURL: photoURL || "" });
      const updated = { ...user, name, phone, city, bio, photoURL: photoURL || "" };
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("settings", JSON.stringify({
        dobMonth, dobDay, dobYear, interests, skills, photo: photoURL, bio,
      }));
      setUser(updated);
    } catch {
      setSaving(false);
      alert("Network error. Could not save profile.");
      return;
    }

    setSaving(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const roleDisplay = role || user.role || "admin";

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search settings..." />
        <div>
          <PageTitle data-aos="fade-down">Settings</PageTitle>
        </div>

        <form onSubmit={handleSave}>
          <Grid>
            {saved && <SuccessMsg data-aos="fade">✓ Settings saved successfully!</SuccessMsg>}

            <Card data-aos="fade-up">
              <CardTitle>📸 Profile Photo</CardTitle>
              <PhotoWrap>
                <PhotoPreview>
                  {photo ? <img src={photo} alt="Preview" /> : user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U"}
                </PhotoPreview>
                <div>
                  <PhotoBtn htmlFor="photo-input">Upload Photo</PhotoBtn>
                  <input ref={fileRef} id="photo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                  <PhotoHint>JPG, PNG or GIF. Max 5MB.</PhotoHint>
                </div>
              </PhotoWrap>
            </Card>

            <Card data-aos="fade-up">
              <CardTitle>🎭 Role</CardTitle>
              <RoleBadge>{roleDisplay === "mentee" ? "Mentee" : roleDisplay === "mentor" ? "Mentor" : "Admin"}</RoleBadge>
              <p style={{ marginTop: 8, fontSize: "0.8rem", color: "var(--color-text-secondary, #594048)" }}>
                Your role is assigned during registration and cannot be changed here.
              </p>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>👤 Personal Information</CardTitle>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Email</FieldLabel>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FieldGroup>
              </FieldRow>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Phone</FieldLabel>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>City</FieldLabel>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </FieldGroup>
              </FieldRow>
              <FieldGroup>
                <FieldLabel>Date of Birth</FieldLabel>
                <FieldRow>
                  <Select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  </Select>
                  <Select value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                    <option value="">Day</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Select value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                    <option value="">Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </FieldRow>
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Brief Description</FieldLabel>
                <Textarea placeholder="Tell us a bit about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </FieldGroup>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🔒 Change Password</CardTitle>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Current Password</FieldLabel>
                  <Input type="password" placeholder="Enter current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>New Password</FieldLabel>
                  <Input type="password" placeholder="Min 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <Input type="password" placeholder="Re-enter new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </FieldGroup>
              </FieldRow>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🎯 Interests</CardTitle>
              <AddRow>
                <Input placeholder="Type a custom interest..." value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())} />
                <AddBtn type="button" onClick={addCustomInterest}>Add</AddBtn>
              </AddRow>
              <TagGrid>
                {interests.map((item) => (
                  <Tag key={item} type="button" $active={true} onClick={() => toggleInterest(item)}>
                    {item}<RemoveTag onClick={(e) => { e.stopPropagation(); toggleInterest(item); }}>✕</RemoveTag>
                  </Tag>
                ))}
                {interestOptions.filter((o) => !interests.includes(o)).map((item) => (
                  <Tag key={item} type="button" $active={false} onClick={() => toggleInterest(item)}>
                    + {item}
                  </Tag>
                ))}
              </TagGrid>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🛠️ Skills</CardTitle>
              <AddRow>
                <Input placeholder="Type a custom skill..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())} />
                <AddBtn type="button" onClick={addCustomSkill}>Add</AddBtn>
              </AddRow>
              <TagGrid>
                {skills.map((item) => (
                  <Tag key={item} type="button" $active={true} onClick={() => toggleSkill(item)}>
                    {item}<RemoveTag onClick={(e) => { e.stopPropagation(); toggleSkill(item); }}>✕</RemoveTag>
                  </Tag>
                ))}
                {skillOptions.filter((o) => !skills.includes(o)).map((item) => (
                  <Tag key={item} type="button" $active={false} onClick={() => toggleSkill(item)}>
                    + {item}
                  </Tag>
                ))}
              </TagGrid>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🔔 Notification Preferences</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(role === "mentor" ? [
                  { key: "newSubmission", label: "New submission received", desc: "When a mentee submits an assignment" },
                  { key: "courseCompleted", label: "Course completed", desc: "When a mentee finishes a course" },
                  { key: "assignmentGraded", label: "Assignment graded", desc: "When you submit a grade" },
                  { key: "menteeEnrolled", label: "Mentee enrolled", desc: "When a new mentee joins your course" },
                  { key: "pendingReview", label: "Pending review reminder", desc: "Daily reminder for ungraded submissions" },
                ] : [
                  { key: "assignmentGraded", label: "Assignment graded", desc: "When your assignment receives a grade" },
                  { key: "courseCompleted", label: "Course completed", desc: "When you finish a course" },
                  { key: "newMessage", label: "New message", desc: "When someone sends you a message" },
                  { key: "submissionReviewed", label: "Submission reviewed", desc: "When your submission is reviewed" },
                  { key: "dailyReminder", label: "Daily learning reminder", desc: "Daily reminder to stay on track" },
                ]).map(n => (
                  <label key={n.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: "1px solid #e0e0e020" }}>
                    <input type="checkbox" checked={notifPrefs[n.key]} onChange={() => toggleNotif(n.key)}
                      style={{ width: 18, height: 18, accentColor: "#b50064", cursor: "pointer" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#2c3e50" }}>{n.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "#594048" }}>{n.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {(role === "admin" || roleDisplay === "admin") && <CommunitySettingsCard />}
          </Grid>

          <BtnRow>
            <SaveBtn type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</SaveBtn>
          </BtnRow>
        </form>
      </Main>
    </Page>
  );
};

const FieldRow2 = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const SaveSmallBtn = styled.button`
  padding: 10px 24px;
  border-radius: 12px;
  background: #b50064;
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  &:hover { opacity: 0.9; }
`;

function CommunitySettingsCard() {
  const [settings, setSettings] = useState({ postsEnabled: true, commentsEnabled: true, memberLimit: 100 });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    getDoc(doc(db, "communitySettings", "main"))
      .then((snap) => { if (snap.exists()) setSettings(snap.data()); })
      .catch(() => {});
  }, []);
  const save = () => {
    setDoc(doc(db, "communitySettings", "main"), settings, { merge: true })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); })
      .catch(() => {});
  };
  return (
    <Card $span2 data-aos="fade-up">
      <CardTitle>💬 Community Settings</CardTitle>
      <FieldRow2>
        <div style={{ flex: 1 }}><FieldLabel>Posts enabled</FieldLabel>
          <Select value={settings.postsEnabled} onChange={e => setSettings({ ...settings, postsEnabled: e.target.value === "true" })}>
            <option value="true">Enabled</option><option value="false">Disabled</option>
          </Select></div>
        <div style={{ flex: 1 }}><FieldLabel>Comments enabled</FieldLabel>
          <Select value={settings.commentsEnabled} onChange={e => setSettings({ ...settings, commentsEnabled: e.target.value === "true" })}>
            <option value="true">Enabled</option><option value="false">Disabled</option>
          </Select></div>
        <div style={{ flex: 1 }}><FieldLabel>Member limit</FieldLabel>
          <Input type="number" value={settings.memberLimit} onChange={e => setSettings({ ...settings, memberLimit: parseInt(e.target.value) || 100 })} /></div>
      </FieldRow2>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveSmallBtn onClick={save}>{saved ? "✅ Saved" : "Save Settings"}</SaveSmallBtn>
      </div>
    </Card>
  );
}
