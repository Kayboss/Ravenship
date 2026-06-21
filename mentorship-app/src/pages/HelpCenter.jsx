import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { addCounsellingRequest } from "../firebase/db";
import { getStoredUser } from "../firebase/auth";

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
  gap: 20px;
  margin-top: 24px;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  ${(props) => props.$span2 && "grid-column: 1 / -1;"}
`;

const CardTitle = styled.h3`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDesc = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const FaqItem = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}40;
  &:last-child { border-bottom: none; }
`;

const FaqQ = styled.p`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  &:after { content: "${(props) => props.$open ? "▾" : "▸"}"; color: ${(props) => props.theme.colors.textSecondary}; }
`;

const FaqA = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-top: 6px;
`;

const ContactBtn = styled.a`
  display: inline-block;
  padding: 10px 24px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 8px;
  &:hover { opacity: 0.9; }
`;

const FormInput = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.colors.outline};
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.textPrimary};
`;

const FormSelect = styled.select`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.colors.outline};
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.colors.surface};
  color: ${p => p.theme.colors.textPrimary};
`;

const faqs = [
  { q: "How do I enroll in a course?", a: "Navigate to My Courses from the sidebar, browse available courses, and click 'Start Course' on any course card to begin your learning journey." },
  { q: "How are assignments submitted?", a: "Go to Submissions in the sidebar, select an accepted assignment and course from the dropdowns, upload your file, and click 'Upload Submission'." },
  { q: "Can I change my password?", a: "Yes, visit Settings from the profile dropdown or sidebar, and use the 'Change Password' section to update your credentials." },
  { q: "How do I connect with other members?", a: "Head to the Community page where you can view members, send friend requests, and chat with your connections." },
  { q: "What should I do if I face a technical issue?", a: "Contact our support team using the button below and we'll get back to you within 24 hours." },
];

export const HelpCenter = () => {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  const [openFaq, setOpenFaq] = React.useState(null);
  const { role } = useParams();
  const isMentee = role === "mentee";
  const user = getStoredUser();

  const [form, setForm] = useState({ name: "", email: "", type: "", dateTime: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.type.trim() || !form.dateTime.trim()) {
      setFormMsg("Please fill in all fields.");
      return;
    }
    setSending(true);
    setFormMsg("");
    try {
      await addCounsellingRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        type: form.type.trim(),
        dateTime: form.dateTime.trim(),
      });
      setSent(true);
      setForm({ name: "", email: "", type: "", dateTime: "" });
      setFormMsg("Request submitted! We'll get back to you soon.");
    } catch (err) {
      setFormMsg(err.message || "Failed to submit. Try again.");
    }
    setSending(false);
  };

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search help topics..." />
        <PageTitle data-aos="fade-down">❓ Help Center</PageTitle>
        <Grid>
          <Card $span2 data-aos="fade-up">
            <CardTitle>📘 Frequently Asked Questions</CardTitle>
            <CardDesc>Quick answers to common questions.</CardDesc>
            {faqs.map((faq, i) => (
              <FaqItem key={i}>
                <FaqQ $open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{faq.q}</FaqQ>
                {openFaq === i && <FaqA>{faq.a}</FaqA>}
              </FaqItem>
            ))}
          </Card>
          {isMentee ? (
            <Card data-aos="fade-up" $span2>
              <CardTitle>📋 Counselling Request Form</CardTitle>
              <CardDesc>Request a counselling session by filling out the form below.</CardDesc>
              {sent ? (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <p style={{fontSize:"1.1rem",fontWeight:700,color:"#2e7d32",marginBottom:12}}>✅ Request Submitted</p>
                  <p style={{fontSize:"0.85rem",color:"#594048",marginBottom:20}}>{formMsg}</p>
                  <ContactBtn as="button" style={{border:"none",cursor:"pointer",fontFamily:"inherit"}} onClick={() => setSent(false)}>Submit Another Request</ContactBtn>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div>
                    <label style={{fontWeight:600,fontSize:"0.85rem",display:"block",marginBottom:4,color:"#2c3e50"}}>Your Name</label>
                    <FormInput type="text" placeholder="eg: Ama Ataa" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,fontSize:"0.85rem",display:"block",marginBottom:4,color:"#2c3e50"}}>Email</label>
                    <FormInput type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,fontSize:"0.85rem",display:"block",marginBottom:4,color:"#2c3e50"}}>Type of Counselling Requesting</label>
                    <FormSelect value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="">Select type...</option>
                      <option value="Academic">Academic</option>
                      <option value="Career">Career</option>
                      <option value="Personal">Personal</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Other">Other</option>
                    </FormSelect>
                  </div>
                  <div>
                    <label style={{fontWeight:600,fontSize:"0.85rem",display:"block",marginBottom:4,color:"#2c3e50"}}>Date / Time You Want to Meet the Counsellor</label>
                    <FormInput type="text" placeholder="e.g. Monday 14th July, 10:00 AM" value={form.dateTime} onChange={e => setForm({...form, dateTime: e.target.value})} />
                  </div>
                  {formMsg && <p style={{fontSize:"0.85rem",color:formMsg.includes("submitted")?"#2e7d32":"#e53935",fontWeight:600}}>{formMsg}</p>}
                  <div>
                    <ContactBtn as="button" type="submit" disabled={sending} style={{border:"none",cursor:sending?"not-allowed":"pointer",fontFamily:"inherit",opacity:sending?0.7:1}}>
                      {sending ? "Submitting..." : "Submit Request"}
                    </ContactBtn>
                  </div>
                </form>
              )}
            </Card>
          ) : (
            <Card data-aos="fade-up">
              <CardTitle>💬 Live Chat</CardTitle>
              <CardDesc>Chat with our support team in real-time during business hours.</CardDesc>
              <ContactBtn as="button" style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => alert("Live chat coming soon!")}>Start Live Chat</ContactBtn>
            </Card>
          )}
          <Card data-aos="fade-up">
            <CardTitle>📧 Email Support</CardTitle>
            <CardDesc>Send us an email and we'll respond within 24 hours.</CardDesc>
            <ContactBtn href="mailto:support@mentorship.com">support@mentorship.com</ContactBtn>
          </Card>
          <Card data-aos="fade-up">
            <CardTitle>📚 Quick Guide</CardTitle>
            <CardDesc>New here? Get started with our platform overview.</CardDesc>
            <ContactBtn href="#" onClick={(e) => { e.preventDefault(); alert("Quick start guide coming soon!") }}>View Quick Start Guide →</ContactBtn>
          </Card>
          <Card data-aos="fade-up">
            <CardTitle>🛠️ Report a Bug</CardTitle>
            <CardDesc>Found an issue? Let us know so we can fix it.</CardDesc>
            <ContactBtn href="mailto:bugs@mentorship.com">Report Bug</ContactBtn>
          </Card>
        </Grid>
      </Main>
    </Page>
  );
};