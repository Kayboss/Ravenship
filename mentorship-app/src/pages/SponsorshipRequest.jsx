import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { addSponsorshipRequest, getUser } from "../firebase/db";
import { getStoredUser, onAuthReady } from "../firebase/auth";

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${p => p.theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${p => p.theme.spacing.xl} ${p => p.theme.spacing.xl};
  @media (max-width: ${p => p.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${p => p.theme.spacing.lg};
  }
  @media (max-width: ${p => p.theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: ${p => p.theme.spacing.sm};
  }
`;

const PageTitle = styled.h2`
  font-size: ${p => p.theme.typography.heading2};
  font-family: ${p => p.theme.typography.fontFamilyHeading};
  color: ${p => p.theme.colors.textPrimary};
  font-weight: 700;
`;

const FormCard = styled.div`
  background: ${p => p.theme.colors.surface};
  border-radius: 20px;
  padding: 32px;
  border: 1px solid ${p => p.theme.colors.outline};
  max-width: 620px;
  margin-top: 24px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.textPrimary};
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.textPrimary};
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.colors.outline};
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.textPrimary};
  resize: vertical;
  min-height: 100px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 4px;
  color: ${p => p.theme.colors.textPrimary};
`;

const SubmitBtn = styled.button`
  display: inline-block;
  padding: 12px 32px;
  border-radius: 12px;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { background: #1565c0; color: #fff; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const BackLink = styled(Link)`
  color: ${p => p.theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  &:hover { color: ${p => p.theme.colors.primary}; }
`;

const generatePDF = async (form, user, groupName) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;
  let y = margin;
  const lineH = 6.5;
  const col2 = pageW - margin;

  const write = (text, size = 10, bold = false, indent = 0) => {
    const lines = doc.splitTextToSize(String(text || ""), col2 - margin - indent);
    if (bold) doc.setFont("Helvetica", "bold"); else doc.setFont("Helvetica", "normal");
    doc.setFontSize(size);
    lines.forEach(l => {
      if (y > 285) { doc.addPage(); y = margin; }
      doc.text(l, margin + indent, y);
      y += lineH * (size / 10);
    });
  };

  // Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sponsorship Request Application", margin, y);
  y += 10;

  // Separator
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, col2, y);
  y += 8;

  // Applicant Info
  doc.setFontSize(13);
  doc.text("Applicant Information", margin, y);
  y += 7;

  if (user.photoURL) {
    try {
      const img = new Image();
      img.src = user.photoURL;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const imgSize = 24;
      doc.addImage(img, "JPEG", margin, y, imgSize, imgSize);
      y += imgSize + 4;
    } catch { y += 2; }
  }

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const infoLines = [
    `Name: ${user.name || ""}`,
    `Email: ${user.email || ""}`,
    `Phone: ${user.phone || ""}`,
    `Location: ${user.city || ""}`,
    `Group: ${groupName || "N/A"}`,
  ];
  infoLines.forEach(l => { write(l, 10); y += 1; });

  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, col2, y);
  y += 6;

  // Form Answers
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Application Details", margin, y);
  y += 8;

  const fields = [
    ["Type of Sponsorship", form.type],
    ["Purpose of Sponsorship", form.purpose],
    ["Amount Requesting", form.amount],
    ["Skills Covered", form.skills],
    ["Expected Pay Date", form.payDate],
    ["Application Letter", form.applicationLetter],
    ["Expected Outcomes", form.expectedOutcomes],
    ["Value for Well-being & Growth", form.value],
  ];

  fields.forEach(([label, val]) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${label}:`, margin, y);
    y += 5;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    write(val || "—", 9.5);
    y += 2;
  });

  // Footer
  y = Math.max(y, 275);
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(128);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Application submitted on ${today}`, margin, 290);
  doc.setTextColor(0);

  return doc.output("datauristring");
};

export const SponsorshipRequest = () => {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  const { role } = useParams();
  const user = getStoredUser();

  const [form, setForm] = useState({
    type: "", purpose: "", value: "", amount: "", skills: "",
    payDate: "", applicationLetter: "", expectedOutcomes: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [groupName, setGroupName] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    if (user?.id && role === "mentee") {
      getUser(user.id).then(u => {
        if (u?.mentorId) {
          getUser(u.mentorId).then(m => { if (m?.groupName) setGroupName(m.groupName); }).catch(e => console.error("getUser/mentor groupName error:", e));
        }
      }).catch(e => console.error("getUser/mentee error:", e));
    }
  }, [authReady, user?.id, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["type", "purpose", "value", "amount", "payDate"];
    const missing = required.some(f => !form[f].trim());
    if (missing) { setFormMsg("Please fill in all required fields."); return; }
    setSending(true);
    setFormMsg("");
    try {
      const pdfData = await generatePDF(form, user, groupName);
      await addSponsorshipRequest({
        ...form,
        groupName,
        pdfData,
      });
      setSent(true);
      setForm({ type: "", purpose: "", value: "", amount: "", skills: "", payDate: "", applicationLetter: "", expectedOutcomes: "" });
      setFormMsg("Sponsorship request submitted! We'll review it and get back to you.");
    } catch (err) {
      setFormMsg(err.message || "Failed to submit. Try again.");
    }
    setSending(false);
  };

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search..." />
        <BackLink to={`/dashboard/${role}/help`}>&larr; Back to Help Center</BackLink>
        <PageTitle data-aos="fade-down">📋 Sponsorship Request</PageTitle>
        <FormCard data-aos="fade-up">
          {sent ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2e7d32", marginBottom: 12 }}>✅ Request Submitted</p>
              <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 24 }}>{formMsg}</p>
              <SubmitBtn onClick={() => setSent(false)}>Submit Another Request</SubmitBtn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Label>Type of Sponsorship *</Label>
                <Select id="sponsorship-type" name="type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="">Select type...</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Community Project">Community Project</option>
                  <option value="Business">Business</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Training">Training</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label>What is the purpose of Sponsorship? *</Label>
                <Input id="sponsorship-purpose" name="purpose" type="text" placeholder="Briefly state the purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
              </div>
              <div>
                <Label>Describe value resulting from the application as related to your well-being and growth if granted. *</Label>
                <TextArea id="sponsorship-value" name="value" placeholder="Explain how this sponsorship will impact your well-being and personal growth..." value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
              </div>
              <div>
                <Label>Amount Requesting *</Label>
                <Input id="sponsorship-amount" name="amount" type="text" placeholder="e.g. GHS 500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label>What type of skills does this training cover?</Label>
                <Input id="sponsorship-skills" name="skills" type="text" placeholder="e.g. Leadership, Digital Marketing, etc." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div>
                <Label>Expected Sponsorship Pay Date *</Label>
                <Input id="sponsorship-payDate" name="payDate" type="date" value={form.payDate} onChange={e => setForm({ ...form, payDate: e.target.value })} />
              </div>
              <div>
                <Label>Write your Application Letter</Label>
                <TextArea id="sponsorship-applicationLetter" name="applicationLetter" placeholder="Write your application letter explaining why you are applying for this sponsorship..." value={form.applicationLetter} onChange={e => setForm({ ...form, applicationLetter: e.target.value })} />
              </div>
              <div>
                <Label>Expected Outcomes when granted this Application</Label>
                <TextArea id="sponsorship-expectedOutcomes" name="expectedOutcomes" placeholder="Describe what outcomes you expect when this sponsorship is granted..." value={form.expectedOutcomes} onChange={e => setForm({ ...form, expectedOutcomes: e.target.value })} />
              </div>
              {formMsg && <p style={{ fontSize: "0.85rem", color: formMsg.includes("submitted") ? "#2e7d32" : "#e53935", fontWeight: 600 }}>{formMsg}</p>}
              <SubmitBtn type="submit" disabled={sending}>{sending ? "Submitting..." : "Submit Application"}</SubmitBtn>
            </form>
          )}
        </FormCard>
      </Main>
    </Page>
  );
};
