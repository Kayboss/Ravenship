import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams, Link } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getCounsellingRequests, deleteCounsellingRequest, getSponsorshipRequests, deleteSponsorshipRequest } from "../firebase/db";
import { onAuthReady } from "../firebase/auth";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

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
  &:hover { background: #1565c0; color: #fff; }
`;



const faqs = [
  { q: "How do I enroll in a course?", a: "Navigate to My Courses from the sidebar, browse available courses, and click 'Start Course' on any course card to begin your learning journey." },
  { q: "How are assignments submitted?", a: "Go to Submissions in the sidebar, select an accepted assignment and course from the dropdowns, upload your file, and click 'Upload Submission'." },
  { q: "Can I change my password?", a: "Yes, visit Settings from the profile dropdown or sidebar, and use the 'Change Password' section to update your credentials." },
  { q: "How do I connect with other members?", a: "Head to the Community page where you can view members, send friend requests, and chat with your connections." },
  { q: "What should I do if I face a technical issue?", a: "Contact our support team using the button below and we'll get back to you within 24 hours." },
];

const AdminSection = styled.div`
  margin-top: 32px;
`;

const AdminSectionTitle = styled.h3`
  font-weight: 700;
  color: ${p => p.theme.colors.textPrimary};
  margin-bottom: 16px;
  font-size: 1.1rem;
`;

const RequestTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RequestRow = styled.div`
  background: ${p => p.theme.colors.surface};
  border-radius: 14px;
  padding: 16px 20px;
  border: 1px solid ${p => p.theme.colors.outline};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  @media (max-width: 600px) { flex-direction: column; }
`;

const RequestInfo = styled.div`
  flex: 1;
  p { margin: 2px 0; font-size: 0.85rem; color: ${p => p.theme.colors.textPrimary}; }
  span { color: ${p => p.theme.colors.textSecondary}; font-size: 0.8rem; }
`;

const DeleteBtn = styled.button`
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  &:hover { opacity: 0.85; }
`;

const EmptyMsg = styled.p`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-style: italic;
`;

const ViewBtn = styled.button`
  background: #1565c0;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  &:hover { opacity: 0.85; }
`;

const PdfOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const PdfModalInner = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  height: 90vh;
  position: relative;
  overflow: hidden;
`;

const PdfCloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 14px;
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  &:hover { opacity: 0.85; }
`;

export const HelpCenter = () => {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  const [openFaq, setOpenFaq] = React.useState(null);
  const { role } = useParams();
  const isMentee = role === "mentee";
  const isAdmin = role === "admin";

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [sponsorReqs, setSponsorReqs] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [pdfModal, setPdfModal] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => { onAuthReady(() => { setAuthReady(true); if (!isAdmin) setLoading(false); }); }, []);

  const fetchRequests = async () => {
    try {
      const [cData, sData] = await Promise.all([
        getCounsellingRequests(),
        getSponsorshipRequests()
      ]);
      setRequests(cData);
      setSponsorReqs(sData);
    } catch { /* ignore */ }
    setLoadingReqs(false);
    setLoadingSponsors(false);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin && authReady) fetchRequests();
  }, [isAdmin, authReady]);

  const handleDelete = async (id) => {
    await deleteCounsellingRequest(id);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteSponsor = async (id) => {
    await deleteSponsorshipRequest(id);
    setSponsorReqs(prev => prev.filter(r => r.id !== id));
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) return <Page><SidebarByRole /><Main><LoadingSpinner label="Loading..." fullHeight /></Main></Page>;
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
            <Card data-aos="fade-up">
              <CardTitle>📋 Counselling Request</CardTitle>
              <CardDesc>Need someone to talk to? Book a counselling session with a professional counsellor.</CardDesc>
              <ContactBtn as={Link} to="/dashboard/mentee/counselling-request">Book Now</ContactBtn>
            </Card>
          ) : (
            <Card data-aos="fade-up">
              <CardTitle>💬 Live Chat</CardTitle>
              <CardDesc>Chat with our support team in real-time during business hours.</CardDesc>
              <ContactBtn as="button" style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => alert("Live chat coming soon!")}>Start Live Chat</ContactBtn>
            </Card>
          )}
          <Card data-aos="fade-up">
            <CardTitle>📋 Sponsorship Request</CardTitle>
            <CardDesc>Apply for sponsorship to support your education, training, or personal development goals.</CardDesc>
            <ContactBtn as={Link} to={`/dashboard/${role}/sponsorship-request`}>Request Sponsorship</ContactBtn>
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

        {isAdmin && (
          <>
            <AdminSection data-aos="fade-up">
              <AdminSectionTitle>📋 Incoming Counselling Requests</AdminSectionTitle>
              {loadingReqs ? (
                <p style={{ color: "#594048", fontSize: "0.85rem" }}>Loading...</p>
              ) : requests.length === 0 ? (
                <EmptyMsg>No counselling requests yet.</EmptyMsg>
              ) : (
                <RequestTable>
                  {requests.map(req => (
                    <RequestRow key={req.id}>
                      <RequestInfo>
                        <p><strong>{req.name}</strong> &lt;{req.email}&gt;</p>
                        <p>Type: {req.type}</p>
                        {req.reasons && <p>Reasons: {req.reasons}</p>}
                        <p>Preferred date: {req.dateTime}</p>
                        <span>Submitted {formatDate(req.createdAt)}</span>
                      </RequestInfo>
                      <DeleteBtn onClick={() => handleDelete(req.id)}>Delete</DeleteBtn>
                    </RequestRow>
                  ))}
                </RequestTable>
              )}
            </AdminSection>

            <AdminSection data-aos="fade-up">
              <AdminSectionTitle>📋 Incoming Sponsorship Requests</AdminSectionTitle>
              {loadingSponsors ? (
                <p style={{ color: "#594048", fontSize: "0.85rem" }}>Loading...</p>
              ) : sponsorReqs.length === 0 ? (
                <EmptyMsg>No sponsorship requests yet.</EmptyMsg>
              ) : (
                <RequestTable>
                  {sponsorReqs.map(req => (
                    <RequestRow key={req.id}>
                      <RequestInfo>
                        <p><strong>{req.userName || req.name}</strong> &lt;{req.userEmail || req.email}&gt;</p>
                        <p>Type: {req.type} | Amount: {req.amount}</p>
                        <p>Purpose: {req.purpose}</p>
                        <span>Submitted {formatDate(req.createdAt)}</span>
                      </RequestInfo>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <ViewBtn onClick={() => setPdfModal(req)}>View PDF</ViewBtn>
                        <DeleteBtn onClick={() => handleDeleteSponsor(req.id)}>Delete</DeleteBtn>
                      </div>
                    </RequestRow>
                  ))}
                </RequestTable>
              )}
            </AdminSection>
          </>
        )}

        {pdfModal && (
          <PdfOverlay onClick={() => setPdfModal(null)}>
            <PdfModalInner onClick={e => e.stopPropagation()}>
              <PdfCloseBtn onClick={() => setPdfModal(null)}>&times;</PdfCloseBtn>
              {pdfModal.pdfData?.startsWith("data:application/pdf") ? (
                <iframe src={pdfModal.pdfData} title="Sponsorship Request PDF" style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }} />
              ) : (
                <p style={{ padding: 40, textAlign: "center", color: "#594048" }}>No PDF data available for this request.</p>
              )}
            </PdfModalInner>
          </PdfOverlay>
        )}
      </Main>
    </Page>
  );
};