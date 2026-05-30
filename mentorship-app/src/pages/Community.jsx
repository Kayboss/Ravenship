import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser } from "../firebase/auth";
import { getPosts, addPost, togglePostLike, getEvents, getUsers } from "../firebase/db";

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

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  @media (max-width: ${(props) => props.theme.breakpoints.laptop}) {
    grid-template-columns: 1fr;
  }
`;

const FeedCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 16px;
  transition: all 0.2s;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${(props) => props.$color || props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: ${(props) => props.$color || props.theme.colors.primary};
`;

const PostAuthor = styled.p`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 0.95rem;
`;

const PostTime = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const PostText = styled.p`
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: 16px;
`;

const PostActions = styled.div`
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid ${(props) => props.theme.colors.outline}50;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: ${(props) => props.$active ? 700 : 400};
  &:hover { background: ${(props) => props.theme.colors.primary}10; color: ${(props) => props.theme.colors.primary}; }
`;

const CommentSection = styled.div`
  padding: 12px 0 0;
  margin-top: 12px;
  border-top: 1px solid ${(props) => props.theme.colors.outline}30;
`;

const CommentItem = styled.div`
  font-size: 0.8rem;
  padding: 6px 0;
  color: ${(props) => props.theme.colors.textPrimary};
  &:last-child { padding-bottom: 0; }
`;

const CommentAuthor = styled.span`
  font-weight: 700;
  margin-right: 6px;
`;

const CommentInputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textPrimary};
  outline: none;
  &:focus { border-color: ${(props) => props.theme.colors.primary}; }
`;

const CreatePostCard = styled(FeedCard)`
  margin-bottom: 20px;
`;

const PostInput = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  resize: none;
  min-height: 60px;
  outline: none;
  margin-top: 12px;
  &::placeholder { color: ${(props) => props.theme.colors.textSecondary}; }
`;

const PostActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${(props) => props.theme.colors.outline}40;
`;

const PostMediaBtn = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover { background: ${(props) => props.theme.colors.primary}10; color: ${(props) => props.theme.colors.primary}; }
`;

const PostSubmitBtn = styled.button`
  padding: 8px 24px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PostImagePreview = styled.div`
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
  background: ${(props) => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
  span { font-size: 2rem; color: ${(props) => props.theme.colors.textSecondary}60; }
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideCard = styled.div`
  background: ${(props) =>
    props.$variant === "online" ? props.theme.colors.success + "08" :
    props.$variant === "events" ? props.theme.colors.secondary + "08" :
    props.$variant === "chat" ? props.theme.colors.primary + "08" :
    props.theme.colors.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${(props) =>
    props.$variant === "online" ? props.theme.colors.success + "30" :
    props.$variant === "events" ? props.theme.colors.secondary + "30" :
    props.$variant === "chat" ? props.theme.colors.primary + "30" :
    props.theme.colors.outline};
`;

const SideTitle = styled.h4`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 16px;
  font-size: 1rem;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${(props) => props.theme.colors.primary}08; }
`;

const MemberName = styled.p`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const MemberRole = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const OnlineDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.$online ? props.theme.colors.success : props.theme.colors.outline};
  flex-shrink: 0;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
`;

const FilterTab = styled.button`
  padding: 5px 14px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.$active ? props.theme.colors.success : props.theme.colors.outline};
  background: ${(props) => props.$active ? props.theme.colors.success + "15" : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.success : props.theme.colors.textSecondary};
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${(props) => props.theme.colors.success}; color: ${(props) => props.theme.colors.success}; }
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 6px;
  color: ${(props) => props.$variant === "friend" ? props.theme.colors.success : props.$variant === "sent" ? props.theme.colors.warning : props.theme.colors.textSecondary};
  transition: all 0.15s;
  line-height: 1;
  font-weight: 700;
  &:hover { opacity: 0.7; }
`;

const RequestRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 10px;
  margin-bottom: 6px;
  background: ${(props) => props.theme.colors.warning}08;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
`;

const SmallBtn = styled.button`
  padding: 4px 12px;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => props.$primary ? props.theme.colors.success : props.theme.colors.outline};
  color: ${(props) => props.$primary ? "#fff" : props.theme.colors.textSecondary};
  transition: opacity 0.15s;
  &:hover { opacity: 0.8; }
`;

const ProfilePopup = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  padding: 32px;
  width: 320px;
  text-align: center;
  position: relative;
`;

const ProfileClose = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ProfileAvatarLarge = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
  margin: 0 auto 12px;
`;

const ProfileNameLarge = styled.p`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ProfileRoleLarge = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const ProfileBadge = styled.div`
  display: inline-block;
  padding: 4px 14px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => props.$online ? props.theme.colors.success + "20" : props.theme.colors.outline};
  color: ${(props) => props.$online ? props.theme.colors.success : props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const ProfileActionBtn = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: ${(props) => props.$primary ? props.theme.colors.primary : "transparent"};
  color: ${(props) => props.$primary ? "#fff" : props.theme.colors.textSecondary};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 8px;
  border: ${(props) => props.$primary ? "none" : "1px solid " + props.theme.colors.outline};
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
`;

const EventItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline}40;
  &:last-child { border-bottom: none; }
`;

const EventDate = styled.div`
  text-align: center;
  min-width: 44px;
`;

const EventDay = styled.p`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.primary};
  line-height: 1;
`;

const EventMonth = styled.p`
  font-size: 0.7rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
`;

const EventDetail = styled.div``;

const EventName = styled.p`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const EventMeta = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 4px;
  &:hover { background: ${(props) => props.theme.colors.primary}15; }
  ${(props) => props.$active && `background: ${props.theme.colors.primary}20;`}
`;

const ContactName = styled.p`
  font-weight: 600;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
  flex: 1;
`;

const ContactOnline = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.$online ? props.theme.colors.success : props.theme.colors.outline};
  flex-shrink: 0;
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${(props) => props.theme.colors.outline}40;
  padding-top: 16px;
  margin-top: 12px;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  color: ${(props) => props.theme.colors.textSecondary};
  &:hover { color: ${(props) => props.theme.colors.primary}; }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const ChatMsg = styled.div`
  max-width: 85%;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 0.8rem;
  line-height: 1.4;
  align-self: ${(props) => props.$mine ? "flex-end" : "flex-start"};
  background: ${(props) => props.$mine ? props.theme.colors.primary : props.theme.colors.background};
  color: ${(props) => props.$mine ? "#fff" : props.theme.colors.textPrimary};
  border-bottom-${(props) => props.$mine ? "right" : "left"}-radius: 4px;
`;

const ChatTime = styled.span`
  font-size: 0.6rem;
  opacity: 0.6;
  display: block;
  margin-top: 4px;
`;

const ChatInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
  outline: none;
  &:focus { border-color: ${(props) => props.theme.colors.primary}; }
`;

const ChatSend = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const posts = [
  { name: "Marcus Chen", role: "Lead Designer", avatarColor: "#b50064", time: "2h ago", text: "Just published a new case study on our design system evolution! Check it out — I'd love feedback from the community. We've been iterating on component consistency for the past 3 sprints.", likes: 12, liked: false, comments: ["Love the case study!", "Great insights Marcus"] },
  { name: "Aisha Patel", role: "Data Scientist", avatarColor: "#006590", time: "5h ago", text: "Great workshop today on predictive modeling. Here are my notes and a sample notebook for anyone who wants to practice. 🧠📊", image: true, likes: 8, liked: true, comments: ["Thanks for sharing!"] },
  { name: "Dr. Sarah Jenkins", role: "UX Director", avatarColor: "#ffd200", time: "1d ago", text: "Reminder: Design Thinking session this Friday will cover advanced prototyping techniques. Come prepared with your case study materials!", likes: 5, liked: false, comments: [] },
];

const members = [
  { name: "Alex Rivera", role: "UI Design Track", online: true },
  { name: "Priya Sharma", role: "Data Track", online: true },
  { name: "James Kim", role: "Engineering Track", online: false },
  { name: "Olivia Foster", role: "Product Track", online: true },
  { name: "Liam O'Brien", role: "Design Track", online: false },
];

const events = [
  { name: "Design Critique Session", day: "14", month: "Oct", meta: "2:00 PM · Virtual · 12 attending" },
  { name: "Guest Speaker: AI in Design", day: "18", month: "Oct", meta: "3:00 PM · Room 401 · 28 attending" },
  { name: "Portfolio Review Workshop", day: "21", month: "Oct", meta: "10:00 AM · Design Lab · 15 spots left" },
];

const contacts = [
  { name: "Alex Rivera", role: "UI Design Track", online: true, initials: "AR" },
  { name: "Priya Sharma", role: "Data Track", online: true, initials: "PS" },
  { name: "Marcus Chen", role: "Lead Designer", online: true, initials: "MC" },
  { name: "Olivia Foster", role: "Product Track", online: false, initials: "OF" },
  { name: "James Kim", role: "Engineering Track", online: false, initials: "JK" },
];

const conversationData = {
  "Alex Rivera": [
    { text: "Hey! Have you started the design system audit?", mine: false, time: "10:14 AM" },
    { text: "Yes, I'm halfway through the component review.", mine: true, time: "10:16 AM" },
    { text: "Nice! Let me know if you need any help with the Figma library.", mine: false, time: "10:18 AM" },
  ],
  "Priya Sharma": [
    { text: "The Q3 dataset is ready. Want me to share the dashboard?", mine: false, time: "9:30 AM" },
    { text: "Yes please! That would be great.", mine: true, time: "9:32 AM" },
  ],
  "Marcus Chen": [
    { text: "Great work on the wireframes! Let's refine the navigation flow.", mine: false, time: "2m ago" },
    { text: "Thanks! I'll push the latest changes tonight.", mine: true, time: "1m ago" },
  ],
  "Olivia Foster": [
    { text: "Are you joining the product strategy session?", mine: false, time: "Yesterday" },
    { text: "Absolutely, already registered!", mine: true, time: "Yesterday" },
  ],
  "James Kim": [
    { text: "Can someone share the Figma link?", mine: false, time: "2:22 PM" },
    { text: "Here it is: https://figma.com/team/mentorship", mine: true, time: "2:25 PM" },
  ],
};

export const Community = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [friendState, setFriendState] = useState({
    friends: ["Priya Sharma", "Marcus Chen"],
    sentRequests: ["Olivia Foster"],
    receivedRequests: ["James Kim", "Liam O'Brien"],
  });
  const [profileView, setProfileView] = useState(null);
  const [postList, setPostList] = useState([]);
  const [memberList, setMemberList] = useState(members);
  const [eventList, setEventList] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likingId, setLikingId] = useState(null);
  const conversationsRef = useRef({ ...conversationData });
  const user = getStoredUser() || { name: "You", role: "Mentee", avatarColor: "#b50064" };

  const syncTopBarMessages = () => {
    const names = Object.keys(conversationsRef.current);
    const msgs = names.map(name => {
      const ms = conversationsRef.current[name];
      const last = ms[ms.length - 1];
      return { icon: "👤", name, text: last?.text || "", time: last?.time || "", replies: ms.filter(m => m.mine).map(m => m.text) };
    });
    localStorage.setItem("topbar_messages", JSON.stringify(msgs));
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    syncTopBarMessages();
    getPosts().then(d => setPostList(Array.isArray(d) ? d : posts)).catch(() => setPostList(posts));
    getUsers().then(d => setMemberList(Array.isArray(d) ? d : members)).catch(() => {});
    getEvents().then(d => setEventList(Array.isArray(d) ? d : events)).catch(() => {});
  }, []);

  const toggleLike = (index) => {
    const post = postList[index];
    if (!post || !post.id || likingId === post.id) return;
    setLikingId(post.id);
    togglePostLike(post.id)
      .then(() => { setLikingId(null); setPostList(prev => prev.map((p, i) => i === index ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)); })
      .catch(() => setLikingId(null));
  };

  const toggleComments = (index) => {
    setCommentsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addComment = (index) => {
    const text = commentInputs[index]?.trim();
    if (!text) return;
    setPostList(prev => prev.map((p, i) =>
      i === index ? { ...p, comments: [...p.comments, { text, author: user.name }] } : p
    ));
    setCommentInputs(prev => ({ ...prev, [index]: "" }));
  };

  const handleNewPostImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submitPost = () => {
    if (!newPostText.trim()) return;
    addPost({text: newPostText})
      .then(d => { setPostList(prev => [d, ...prev]); setNewPostText(""); setNewPostImage(null); })
      .catch(() => {});
  };

  const filteredMembers = memberFilter === "online" ? members.filter(m => m.online) : members;

  const getRelation = (name) => {
    if (friendState.friends.includes(name)) return "friend";
    if (friendState.sentRequests.includes(name)) return "sent";
    if (friendState.receivedRequests.includes(name)) return "received";
    return "none";
  };

  const sendRequest = (name, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (getRelation(name) !== "none") return;
    setFriendState(prev => ({ ...prev, sentRequests: [...prev.sentRequests, name] }));
  };

  const acceptRequest = (name, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setFriendState(prev => ({
      friends: [...prev.friends, name],
      sentRequests: prev.sentRequests.filter(n => n !== name),
      receivedRequests: prev.receivedRequests.filter(n => n !== name),
    }));
  };

  const declineRequest = (name, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setFriendState(prev => ({
      ...prev,
      receivedRequests: prev.receivedRequests.filter(n => n !== name),
    }));
  };

  const unfriend = (name, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setFriendState(prev => ({ ...prev, friends: prev.friends.filter(n => n !== name) }));
  };

  const cancelRequest = (name, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setFriendState(prev => ({ ...prev, sentRequests: prev.sentRequests.filter(n => n !== name) }));
  };

  const friendsOnly = contacts.filter(c => friendState.friends.includes(c.name));

  const openChat = (contact) => {
    setChatContact(contact);
    setChatMsgs(conversationsRef.current[contact.name] || []);
    setChatOpen(true);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !chatContact) return;
    const newMsg = { text: chatInput, mine: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMsgs(prev => [...prev, newMsg]);
    if (!conversationsRef.current[chatContact.name]) conversationsRef.current[chatContact.name] = [];
    conversationsRef.current = { ...conversationsRef.current, [chatContact.name]: [...conversationsRef.current[chatContact.name], newMsg] };
    setChatInput("");
    syncTopBarMessages();
  };

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search community..." />
        <PageTitle data-aos="fade-down">Community</PageTitle>
        <Layout>
          <div>
            <CreatePostCard data-aos="fade-up">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar $color={user.avatarColor} style={{ width: 40, height: 40, fontSize: "0.8rem", flexShrink: 0 }}>U</Avatar>
                <div style={{ flex: 1 }}>
                  <PostInput placeholder="Share something with the community..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
                  {newPostImage && (
                    <PostImagePreview>
                      <img src={newPostImage} alt="Preview" />
                    </PostImagePreview>
                  )}
                  <PostActionsRow>
                    <PostMediaBtn htmlFor="post-image-input">
                      📷 {newPostImage ? "Change Image" : "Add Image"}
                    </PostMediaBtn>
                    <input id="post-image-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleNewPostImage} />
                    {newPostImage && <PostMediaBtn as="button" type="button" style={{ border: "none", background: "none", fontFamily: "inherit" }} onClick={() => setNewPostImage(null)}>✕ Remove</PostMediaBtn>}
                    <PostSubmitBtn disabled={!newPostText.trim()} onClick={submitPost}>Post</PostSubmitBtn>
                  </PostActionsRow>
                </div>
              </div>
            </CreatePostCard>
            {postList.map((p, i) => (
              <FeedCard key={i} data-aos="fade-up" data-aos-delay={i * 50}>
                <PostHeader>
                  <Avatar $color={p.avatarColor}>{p.name.split(" ").map(w => w[0]).join("")}</Avatar>
                  <div>
                    <PostAuthor>{p.name}</PostAuthor>
                    <PostTime>{p.role} · {p.time}</PostTime>
                  </div>
                </PostHeader>
                <PostText>{p.text}</PostText>
                {p.image && <PostImagePreview>{typeof p.image === "string" && p.image.startsWith("data:") ? <img src={p.image} alt="Post" /> : <span>📊 Chart Preview</span>}</PostImagePreview>}
                <PostActions>
                  <ActionBtn $active={p.liked} onClick={() => toggleLike(i)}>{p.liked ? "❤️" : "🤍"} {p.likes}</ActionBtn>
                  <ActionBtn $active={commentsOpen[i]} onClick={() => toggleComments(i)}>💬 {p.comments.length}</ActionBtn>
                </PostActions>
                {commentsOpen[i] && (
                  <CommentSection>
                    {p.comments.length === 0 && <CommentItem style={{ color: "var(--color-text-secondary, #594048)" }}>No comments yet.</CommentItem>}
                    {p.comments.map((c, j) => (
                      <CommentItem key={j}><CommentAuthor>{c.author || "Anonymous"}</CommentAuthor>{c.text || c}</CommentItem>
                    ))}
                    <CommentInputRow>
                      <CommentInput placeholder="Write a comment..." value={commentInputs[i] || ""} onChange={(e) => setCommentInputs(prev => ({ ...prev, [i]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addComment(i)} />
                      <ActionBtn style={{ padding: "8px 12px" }} $active={!!commentInputs[i]?.trim()} onClick={() => addComment(i)}>Post</ActionBtn>
                    </CommentInputRow>
                  </CommentSection>
                )}
              </FeedCard>
            ))}
          </div>
          <SideSection>
            <SideCard $variant="online">
              <SideTitle>👥 Members</SideTitle>
              <FilterRow>
                <FilterTab $active={memberFilter === "all"} onClick={() => setMemberFilter("all")}>All Members</FilterTab>
                <FilterTab $active={memberFilter === "online"} onClick={() => setMemberFilter("online")}>Online Now</FilterTab>
              </FilterRow>
              {filteredMembers.map((m, i) => {
                const rel = getRelation(m.name);
                return (
                  <MemberRow key={i} onClick={() => setProfileView(m)}>
                    <Avatar $color={m.online ? undefined : props => props.theme.colors.outline} style={{ width: 32, height: 32, fontSize: "0.7rem" }}>
                      {m.name.split(" ").map(w => w[0]).join("")}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <MemberName>{m.name}</MemberName>
                      <MemberRole>{m.role}</MemberRole>
                    </div>
                    {rel === "none" && <ActionIcon $variant="none" onClick={(e) => sendRequest(m.name, e)} title="Add friend">+</ActionIcon>}
                    {rel === "sent" && <ActionIcon $variant="sent" onClick={(e) => cancelRequest(m.name, e)} title="Cancel request">⏳</ActionIcon>}
                    {rel === "friend" && <ActionIcon $variant="friend" onClick={(e) => unfriend(m.name, e)} title="Unfriend">✓</ActionIcon>}
                    <OnlineDot $online={m.online} />
                  </MemberRow>
                );
              })}
            </SideCard>
            {friendState.receivedRequests.length > 0 && (
              <SideCard $variant="online">
                <SideTitle>📩 Friend Requests</SideTitle>
                {friendState.receivedRequests.map((name, i) => (
                  <RequestRow key={i}>
                    <Avatar style={{ width: 28, height: 28, fontSize: "0.65rem" }}>{name.split(" ").map(w => w[0]).join("")}</Avatar>
                    <MemberName style={{ flex: 1, fontSize: "0.8rem" }}>{name}</MemberName>
                    <RequestActions>
                      <SmallBtn $primary onClick={(e) => acceptRequest(name, e)}>Accept</SmallBtn>
                      <SmallBtn onClick={(e) => declineRequest(name, e)}>Decline</SmallBtn>
                    </RequestActions>
                  </RequestRow>
                ))}
              </SideCard>
            )}
            <SideCard $variant="chat">
              <SideTitle>💬 Messages</SideTitle>
              {!chatOpen ? (
                friendsOnly.length > 0 ? friendsOnly.map((c, i) => (
                  <ContactRow key={i} onClick={() => openChat(c)}>
                    <Avatar style={{ width: 32, height: 32, fontSize: "0.7rem" }}>{c.initials}</Avatar>
                    <ContactName>{c.name}</ContactName>
                    <ContactOnline $online={c.online} />
                  </ContactRow>
                )) : <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary, #594048)", textAlign: "center", padding: "16px 0" }}>No friends yet. Add friends from the Members list to start chatting!</p>
              ) : (
                <ChatBox>
                  <ChatHeader>
                    <BackBtn onClick={() => { setChatOpen(false); setChatContact(null); }}>←</BackBtn>
                    Chatting with {chatContact?.name}
                  </ChatHeader>
                  <ChatMessages>
                    {chatMsgs.map((msg, i) => (
                      <ChatMsg key={i} $mine={msg.mine}>
                        {msg.text}
                        <ChatTime>{msg.time}</ChatTime>
                      </ChatMsg>
                    ))}
                  </ChatMessages>
                  <ChatInputRow>
                    <ChatInput placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
                    <ChatSend onClick={sendChat}>➤</ChatSend>
                  </ChatInputRow>
                </ChatBox>
              )}
            </SideCard>
            <SideCard $variant="events">
              <SideTitle>📅 Upcoming Events</SideTitle>
              {events.map((e, i) => (
                <EventItem key={i}>
                  <EventDate>
                    <EventDay>{e.day}</EventDay>
                    <EventMonth>{e.month}</EventMonth>
                  </EventDate>
                  <EventDetail>
                    <EventName>{e.name}</EventName>
                    <EventMeta>{e.meta}</EventMeta>
                  </EventDetail>
                </EventItem>
              ))}
            </SideCard>
          </SideSection>
        </Layout>
      </Main>
      {profileView && (
        <ProfilePopup onClick={() => setProfileView(null)}>
          <ProfileCard onClick={(e) => e.stopPropagation()}>
            <ProfileClose onClick={() => setProfileView(null)}>✕</ProfileClose>
            <ProfileAvatarLarge>{profileView.name.split(" ").map(w => w[0]).join("")}</ProfileAvatarLarge>
            <ProfileNameLarge>{profileView.name}</ProfileNameLarge>
            <ProfileRoleLarge>{profileView.role}</ProfileRoleLarge>
            <ProfileBadge $online={profileView.online}>{profileView.online ? "🟢 Online" : "⚪ Offline"}</ProfileBadge>
            {getRelation(profileView.name) === "friend" && (
              <ProfileActionBtn $primary onClick={() => { const c = contacts.find(c => c.name === profileView.name) || { name: profileView.name, role: profileView.role, online: profileView.online, initials: profileView.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) }; openChat(c); setProfileView(null); }}>
                💬 Send Message
              </ProfileActionBtn>
            )}
            {getRelation(profileView.name) === "none" && (
              <ProfileActionBtn $primary onClick={() => { sendRequest(profileView.name); setProfileView(null); }}>+ Send Friend Request</ProfileActionBtn>
            )}
            {getRelation(profileView.name) === "sent" && (
              <ProfileActionBtn onClick={() => { cancelRequest(profileView.name); setProfileView(null); }}>⏳ Cancel Request</ProfileActionBtn>
            )}
            {getRelation(profileView.name) === "received" && (
              <ProfileActionBtn $primary onClick={() => { acceptRequest(profileView.name); setProfileView(null); }}>✓ Accept Request</ProfileActionBtn>
            )}
            {getRelation(profileView.name) === "friend" && (
              <ProfileActionBtn onClick={() => { unfriend(profileView.name); setProfileView(null); }}>Remove Friend</ProfileActionBtn>
            )}
          </ProfileCard>
        </ProfilePopup>
      )}
    </Page>
  );
};
