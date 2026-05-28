import React, { useEffect } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";

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
          <Card data-aos="fade-up">
            <CardTitle>💬 Live Chat</CardTitle>
            <CardDesc>Chat with our support team in real-time during business hours.</CardDesc>
            <ContactBtn as="button" style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => alert("Live chat coming soon!")}>Start Live Chat</ContactBtn>
          </Card>
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