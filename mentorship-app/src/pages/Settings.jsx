import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { updateUser, logActivity, getUser } from "../firebase/db";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toBase64ImageWithProgress } from "../lib/upload";

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
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
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
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  min-height: 40px;
  &:hover { opacity: 0.9; }
`;

const PhotoHint = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 6px;
`;

const ProgressWrap = styled.div`
  margin-top: 12px;
  width: 100%;
`;

const ProgressBar = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${(props) => props.theme.colors.outline};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${(props) => props.theme.colors.primary};
  width: ${(props) => props.$pct}%;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 4px;
`;

const FileName = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
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
  @media (max-width: 480px) {
    flex-direction: column;
    input { width: 100%; }
    button { width: 100%; min-height: 40px; }
  }
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
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [photo, setPhoto] = useState("");
  const [bio, setBio] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    const sUser = getStoredUser();
    if (!sUser?.id) return;
    getUser(sUser.id).then(data => {
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setDobMonth(data.dobMonth || "");
        setDobDay(data.dobDay || "");
        setDobYear(data.dobYear || "");
        setInterests(data.interests || []);
        setSkills(data.skills || []);
        setBio(data.bio || "");
        setPhoto(data.photoURL || "");
        setNotifPrefs(data.notifPrefs || (role === "mentor"
          ? { newSubmission: true, courseCompleted: true, assignmentGraded: true, menteeEnrolled: true, pendingReview: true }
          : { assignmentGraded: true, courseCompleted: true, newMessage: true, submissionReviewed: true, dailyReminder: true }));
      }
      setLoading(false);
    }).catch(e => {
      console.error("Settings load error:", e);
      const cached = localStorage.getItem("settings_" + sUser.id);
      if (cached) {
        try {
          const s = JSON.parse(cached);
          setName(s.name || ""); setEmail(s.email || ""); setPhone(s.phone || "");
          setCity(s.city || ""); setDobMonth(s.dobMonth || ""); setDobDay(s.dobDay || "");
          setDobYear(s.dobYear || ""); setInterests(s.interests || []); setSkills(s.skills || []);
          setBio(s.bio || ""); setPhoto(s.photo || "");
        } catch {}
      }
      setLoading(false);
    });
  }, [authReady]);

  const [notifPrefs, setNotifPrefs] = useState({});
  const toggleNotif = (key) => {
    setNotifPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const sUser = getStoredUser();
      if (sUser?.id) updateUser(sUser.id, { notifPrefs: next }).catch(e => console.error("save notifPrefs error:", e));
      return next;
    });
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
    setUploadProgress(0);
    setUploadStage("");

    if (currentPw || newPw || confirmPw) {
      if (newPw !== confirmPw) { setSaving(false); alert("Passwords do not match."); return; }
      if (newPw.length < 8) { setSaving(false); alert("Password must be at least 8 characters."); return; }
    }

    try {
      const sUser = getStoredUser();
      let photoURL = photo;
      if (photoFile) {
        setUploadStage("Reading file...");
        setUploadProgress(0);
        photoURL = await toBase64ImageWithProgress(photoFile, setUploadProgress);
        setUploadStage("Saving to server...");
        setUploadProgress(80);
        setPhotoFile(null);
      }
      await updateUser(sUser.id, { name, phone, city, bio, photoURL: photoURL || "", dobMonth, dobDay, dobYear, interests, skills });
      setUploadProgress(95);
      const updated = { ...sUser, name, phone, city, bio, photoURL: photoURL || "" };
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("settings_" + sUser.id, JSON.stringify({
        name, email, phone, city, dobMonth, dobDay, dobYear, interests, skills, photo: photoURL, bio,
      }));
      logActivity("Updated profile", { detail: `${sUser.name} updated their profile settings` });
      setUploadProgress(100);
      setUploadStage("");
    } catch (err) {
      setSaving(false);
      setUploadStage("");
      setUploadProgress(0);
      console.error("Settings save error:", err);
      alert(err?.message || "Network error. Could not save profile.");
      return;
    }

    if (currentPw && newPw) {
      try {
        const auth = getAuth();
        const fbUser = auth.currentUser;
        if (fbUser && fbUser.email) {
          const credential = EmailAuthProvider.credential(fbUser.email, currentPw);
          await reauthenticateWithCredential(fbUser, credential);
          await updatePassword(fbUser, newPw);
        }
      } catch (err) {
        setSaving(false);
        alert("Password change failed: " + (err.message || "Unknown error"));
        return;
      }
    }

    setSaving(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const roleDisplay = role || getStoredUser()?.role || "admin";

  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  // When not authReady or loading, skip render to avoid Flash of wrong data

  if (loading) return (
    <Page>
      <SidebarByRole />
      <Main style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#594048", fontSize: "0.95rem" }}>Loading settings...</p>
      </Main>
    </Page>
  );

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar hideSearch />
        <div>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#b50064", marginRight: 8, verticalAlign: "middle" }}>← </button>
          <PageTitle data-aos="fade-down">Settings</PageTitle>
        </div>

        <form onSubmit={handleSave}>
          <Grid>
            {saved && <SuccessMsg data-aos="fade">✓ Settings saved successfully!</SuccessMsg>}

            <Card data-aos="fade-up">
              <CardTitle>📸 Profile Photo</CardTitle>
              <PhotoWrap>
                <PhotoPreview>
                  {photo ? <img src={photo} alt="Preview" /> : (initials || "U")}
                </PhotoPreview>
                <div style={{flex:1,minWidth:0}}>
                  <PhotoBtn htmlFor="photo-input">📷 Choose Photo</PhotoBtn>
                  <input ref={fileRef} id="photo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                  {photoFile && !saving && <FileName>{photoFile.name}</FileName>}
                  {(uploadProgress > 0 || saving) && (
                    <ProgressWrap>
                      <ProgressBar>
                        <ProgressFill $pct={uploadProgress} />
                      </ProgressBar>
                      {uploadStage && <ProgressLabel>{uploadStage} {uploadProgress}%</ProgressLabel>}
                    </ProgressWrap>
                  )}
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
                  <Input id="settings-fullName" name="fullName" value={name} onChange={(e) => setName(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Email</FieldLabel>
                  <Input id="settings-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FieldGroup>
              </FieldRow>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Phone</FieldLabel>
                  <Input id="settings-phone" name="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>City</FieldLabel>
                  <Input id="settings-city" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </FieldGroup>
              </FieldRow>
              <FieldGroup>
                <FieldLabel>Date of Birth</FieldLabel>
                <FieldRow>
                  <Select id="settings-dobMonth" name="dobMonth" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  </Select>
                  <Select id="settings-dobDay" name="dobDay" value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                    <option value="">Day</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Select id="settings-dobYear" name="dobYear" value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                    <option value="">Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </FieldRow>
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Brief Description</FieldLabel>
                <Textarea id="settings-bio" name="bio" placeholder="Tell us a bit about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </FieldGroup>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🔒 Change Password</CardTitle>
              <FieldRow>
                <FieldGroup>
                  <FieldLabel>Current Password</FieldLabel>
                  <Input id="settings-currentPassword" name="currentPassword" type="password" placeholder="Enter current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>New Password</FieldLabel>
                  <Input id="settings-newPassword" name="newPassword" type="password" placeholder="Min 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <Input id="settings-confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </FieldGroup>
              </FieldRow>
            </Card>

            <Card $span2 data-aos="fade-up">
              <CardTitle>🎯 Interests</CardTitle>
              <AddRow>
                <Input id="settings-customInterest" name="customInterest" placeholder="Type a custom interest..." value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())} />
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
                <Input id="settings-customSkill" name="customSkill" placeholder="Type a custom skill..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())} />
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
                    <input type="checkbox" id={`notif-${n.key}`} checked={notifPrefs[n.key]} onChange={() => toggleNotif(n.key)}
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
  flex-wrap: wrap;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
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
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);
  useEffect(() => {
    if (!authReady) return;
    getDoc(doc(db, "communitySettings", "main"))
      .then((snap) => { if (snap.exists()) setSettings(snap.data()); })
      .catch(e => console.error("getCommunitySettings error:", e));
  }, [authReady]);
  const save = () => {
    setDoc(doc(db, "communitySettings", "main"), settings, { merge: true })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); })
      .catch(e => console.error("saveCommunitySettings error:", e));
  };
  return (
    <Card $span2 data-aos="fade-up">
      <CardTitle>💬 Community Settings</CardTitle>
      <FieldRow2>
        <div style={{ flex: 1 }}><FieldLabel>Posts enabled</FieldLabel>
          <Select id="settings-postsEnabled" name="postsEnabled" value={settings.postsEnabled} onChange={e => setSettings({ ...settings, postsEnabled: e.target.value === "true" })}>
            <option value="true">Enabled</option><option value="false">Disabled</option>
          </Select></div>
        <div style={{ flex: 1 }}><FieldLabel>Comments enabled</FieldLabel>
          <Select id="settings-commentsEnabled" name="commentsEnabled" value={settings.commentsEnabled} onChange={e => setSettings({ ...settings, commentsEnabled: e.target.value === "true" })}>
            <option value="true">Enabled</option><option value="false">Disabled</option>
          </Select></div>
        <div style={{ flex: 1 }}><FieldLabel>Member limit</FieldLabel>
          <Input id="settings-memberLimit" name="memberLimit" type="number" value={settings.memberLimit} onChange={e => setSettings({ ...settings, memberLimit: parseInt(e.target.value) || 100 })} /></div>
      </FieldRow2>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveSmallBtn onClick={save}>{saved ? "✅ Saved" : "Save Settings"}</SaveSmallBtn>
      </div>
    </Card>
  );
}
