import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, Link } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { addCounsellingRequest } from "../firebase/db";

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
  max-width: 560px;
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
  &:hover { opacity: 0.9; }
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

export const CounsellingRequest = () => {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  const { role } = useParams();

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
        <TopBar searchPlaceholder="Search..." />
        <BackLink to={`/dashboard/${role}/help`}>&larr; Back to Help Center</BackLink>
        <PageTitle data-aos="fade-down">📋 Counselling Request</PageTitle>
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
                <Label>Your Name</Label>
                <Input type="text" placeholder="eg: Ama Ataa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Type of Counselling Requesting</Label>
                <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="">Select type...</option>
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Personal">Personal</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label>Date / Time You Want to Meet the Counsellor</Label>
                <Input type="text" placeholder="e.g. Monday 14th July, 10:00 AM" value={form.dateTime} onChange={e => setForm({ ...form, dateTime: e.target.value })} />
              </div>
              {formMsg && <p style={{ fontSize: "0.85rem", color: formMsg.includes("submitted") ? "#2e7d32" : "#e53935", fontWeight: 600 }}>{formMsg}</p>}
              <SubmitBtn type="submit" disabled={sending}>{sending ? "Submitting..." : "Submit Request"}</SubmitBtn>
            </form>
          )}
        </FormCard>
      </Main>
    </Page>
  );
};
