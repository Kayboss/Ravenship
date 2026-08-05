import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { MentorSidebar } from "../components/layout/MentorSidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { logger } from "../lib/logger";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { getUsers } from "../firebase/db";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${props => props.theme.spacing.sm};
  }
`;

const PageTitle = styled.h2`
  font-size: ${props => props.theme.typography.heading2};
  font-family: ${props => props.theme.typography.fontFamilyHeading};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 8px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const PageSub = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 32px;
  font-size: 0.95rem;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-bottom: 20px;
    font-size: 0.85rem;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  border: 1px solid ${props => props.theme.colors.outline};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.outline}40;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
`;

const MenteeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  padding: 24px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }
`;

const MenteeCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.outline}40;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s;
  &:hover {
    border-color: ${props => props.theme.colors.primary}40;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

const MenteeTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primaryContainer};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const MenteeInfo = styled.div`
  flex: 1;
`;

const MenteeName = styled.h4`
  font-weight: 700;
  font-size: 1rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const MenteeEmail = styled.p`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 2px;
`;

const CourseTag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  background: ${props => props.theme.colors.secondary}15;
  color: ${props => props.theme.colors.secondary};
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 6px;
  margin-bottom: 6px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: ${props => props.theme.colors.outline}30;
  border-radius: 50px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$width >= 100 ? props.theme.colors.success : props.theme.colors.primaryContainer};
  border-radius: 50px;
  transition: width 0.8s;
`;

const ProgressLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${props => props.$width >= 100 ? props.theme.colors.success : props.theme.colors.textSecondary};
  margin-top: 4px;
  display: block;
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$online ? "#27AE60" : props.theme.colors.outline};
  margin-right: 6px;
`;

const BioOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const BioModal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
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
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: ${props => props.theme.colors.outline}40; }
`;

const BioAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primaryContainer};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.6rem;
  margin: 0 auto 16px;
`;

const BioName = styled.h3`
  text-align: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const BioRole = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const BioSection = styled.div`
  margin-bottom: 20px;
`;

const BioLabel = styled.p`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const BioText = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
`;

const BioTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const BioTag = styled.span`
  padding: 4px 12px;
  border-radius: 50px;
  background: ${props => props.theme.colors.primary}12;
  color: ${props => props.theme.colors.primary};
  font-size: 0.78rem;
  font-weight: 600;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const InfoLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  min-width: 70px;
`;

export const MyMentees = () => {
  const { role } = useParams();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true, offset: 50 });
    const currentUser = getStoredUser();
    const mentorId = currentUser?.id;
    getUsers().then(allUsers => {
      const mentees = allUsers.filter(u => u.role === "mentee" && u.mentorId === mentorId);
      if (mentees.length > 0) {
        setMentees(mentees.map(u => ({
          name: u.name || u.email?.split("@")[0] || "Unknown",
          email: u.email || "",
          phone: u.phone || "",
          city: u.city || "",
          bio: u.bio || "",
          courses: u.courses || [],
          progress: u.progress || 0,
          online: u.online || false,
          enrolledDate: u.enrolledDate || "",
          initials: (u.name || u.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
          avatarColor: u.avatarColor || "#006590",
          skills: u.skills || [],
        })));
      }
    }).catch(e => logger.error("getMentees error:", e)).finally(() => setLoading(false));
  }, [authReady]);

  const q = searchTerm.toLowerCase();
  const filteredMentees = mentees.filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q));

  if (loading) return <Page><MentorSidebar /><Main><LoadingSpinner label="Loading..." fullHeight /></Main></Page>;
  return (
    <Page>
      <MentorSidebar />
      <Main>
        <TopBar searchPlaceholder="Search mentees..." onSearch={setSearchTerm} />
        <PageTitle data-aos="fade-down">My Mentees</PageTitle>
        <PageSub data-aos="fade-down">View and manage the mentees enrolled in your courses.</PageSub>

        <Card data-aos="fade-up">
          <CardHeader>
            <CardTitle>All Mentees ({mentees.length})</CardTitle>
          </CardHeader>
          <MenteeGrid>
            {filteredMentees.length === 0 && searchTerm ? <p style={{gridColumn:"1/-1",color:"#594048",fontSize:"0.85rem",textAlign:"center",padding:48}}>No mentees match "{searchTerm}".</p> : filteredMentees.map((m, i) => (
              <MenteeCard key={i} onClick={() => setViewing(m)}>
                <MenteeTop>
                  <Avatar $color={m.avatarColor}>{m.initials}</Avatar>
                  <MenteeInfo>
                    <MenteeName>{m.name}</MenteeName>
                    <MenteeEmail>{m.email}</MenteeEmail>
                  </MenteeInfo>
                  <StatusDot $online={m.online} style={{ width: 12, height: 12, flexShrink: 0 }} />
                </MenteeTop>
                <div>
                  {m.courses.map((c, j) => (
                    <CourseTag key={j}>{c}</CourseTag>
                  ))}
                </div>
                <div>
                  <ProgressBar>
                    <ProgressFill $width={m.progress} />
                  </ProgressBar>
                  <ProgressLabel $width={m.progress}>{m.progress}% complete</ProgressLabel>
                </div>
              </MenteeCard>
            ))}
          </MenteeGrid>
        </Card>
      </Main>

      {viewing && (
        <BioOverlay onClick={() => setViewing(null)}>
          <BioModal onClick={e => e.stopPropagation()}>
            <CloseBtn onClick={() => setViewing(null)}>✕</CloseBtn>
            <BioAvatar $color={viewing.avatarColor}>{viewing.initials}</BioAvatar>
            <BioName>{viewing.name}</BioName>
            <BioRole>{viewing.courses.join(" · ")}</BioRole>

            <BioSection>
              <BioLabel>Biography</BioLabel>
              <BioText>{viewing.bio}</BioText>
            </BioSection>

            <BioSection>
              <BioLabel>Skills</BioLabel>
              <BioTags>
                {viewing.skills.map((s, i) => <BioTag key={i}>{s}</BioTag>)}
              </BioTags>
            </BioSection>

            <BioSection>
              <BioLabel>Contact</BioLabel>
              <InfoRow><InfoLabel>Email</InfoLabel>{viewing.email}</InfoRow>
              <InfoRow><InfoLabel>Phone</InfoLabel>{viewing.phone}</InfoRow>
              <InfoRow><InfoLabel>Location</InfoLabel>{viewing.city}</InfoRow>
              <InfoRow><InfoLabel>Enrolled</InfoLabel>{viewing.enrolledDate}</InfoRow>
            </BioSection>

            <BioSection>
              <BioLabel>Progress</BioLabel>
              <ProgressBar>
                <ProgressFill $width={viewing.progress} />
              </ProgressBar>
              <ProgressLabel $width={viewing.progress}>{viewing.progress}% overall</ProgressLabel>
            </BioSection>
          </BioModal>
        </BioOverlay>
      )}
    </Page>
  );
};
