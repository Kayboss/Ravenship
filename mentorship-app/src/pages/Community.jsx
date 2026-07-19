import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation, useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady, isUserOnline } from "../firebase/auth";
import { getPosts, addPost, updatePost, deletePost, togglePostLike, addComment as fbAddComment, getEvents, getUsers, getOrCreateConversation, sendMessage, subscribeMessages, subscribeConversations, markMessagesRead, subscribeConversation, setTyping } from "../firebase/db";
import { db } from "../firebase/config";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { collection, onSnapshot } from "firebase/firestore";

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

const ExpandBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 8px;
  color: ${(props) => props.theme.colors.textSecondary};
  transition: all 0.15s;
  &:hover { background: ${(props) => props.theme.colors.primary}15; color: ${(props) => props.theme.colors.primary}; }
`;

const ChatPopupOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ChatPopupCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 24px;
  width: 520px;
  max-width: 100%;
  height: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

export const Community = () => {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatConvId, setChatConvId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [memberFilter, setMemberFilter] = useState("all");
  const [profileView, setProfileView] = useState(null);
  const [postList, setPostList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likingId, setLikingId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostText, setEditingPostText] = useState("");
  const unsubMessagesRef = useRef(null);
  const unsubConvRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [visibleMembers, setVisibleMembers] = useState(15);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser() || { name: "You", role: "Mentee", avatarColor: "#b50064" };
  const isPostAuthor = (p) => user?.id && (p.authorId === user.id || p.authorId === user.uid);

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true });
    Promise.all([
      getPosts().then(d => setPostList(Array.isArray(d) ? d : [])).catch(e => console.error("getPosts error:", e)),
      getUsers().then(d => {
        const members = Array.isArray(d) ? d : [];
        setMemberList(members.map(m => ({
          ...m,
          online: isUserOnline(m.lastSeen),
        })));
      }).catch(e => console.error("getUsers error:", e)),
      getEvents().then(d => setEventList(Array.isArray(d) ? d : [])).catch(e => console.error("getEvents error:", e)),
    ]).finally(() => setLoading(false));
    const stateTarget = location.state?.chatTarget;
    if (stateTarget?.id && stateTarget?.name) {
      openChat(stateTarget).then(() => setChatPopupOpen(true));
      window.history.replaceState({}, "");
    }
  }, [authReady, location.state]);

  useEffect(() => {
    if (!authReady) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "modified" || change.type === "added") {
          const data = change.doc.data();
          const isOnline = isUserOnline(data.lastSeen);
          setMemberList(prev => prev.map(m =>
            m.id === change.doc.id ? { ...m, online: isOnline } : m
          ));
        }
      });
    });
    return () => unsub();
  }, [authReady]);

  useEffect(() => {
    if (!authReady || !user?.id) return;
    const unsub = subscribeConversations(user.id, (data) => {
      setConversations(data);
    });
    return () => unsub();
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!chatConvId || !user?.id) return;
    if (unsubConvRef.current) unsubConvRef.current();
    unsubConvRef.current = subscribeConversation(chatConvId, (conv) => {
      if (!conv) return;
      const otherId = conv.participants?.find(id => id !== user.id);
      const isTyping = otherId && conv.typing?.[otherId] === true;
      setOtherTyping(!!isTyping);
    });
    return () => { if (unsubConvRef.current) unsubConvRef.current(); };
  }, [chatConvId, user?.id]);

  const fmtTime = (ts) => {
    if (!ts) return "";
    if (ts?.toDate) ts = ts.toDate();
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const toggleLike = (index) => {
    const post = postList[index];
    if (!post || !post.id || likingId === post.id) return;
    setLikingId(post.id);
    togglePostLike(post.id)
      .then(() => {
        setLikingId(null);
        setPostList(prev => prev.map((p, i) => {
          if (i !== index) return p;
          const wasLiked = p.liked ?? (user?.id && p.likes?.includes(user.id));
          const newLikes = wasLiked
            ? (p.likes || []).filter(id => id !== user.id)
            : [...(p.likes || []), user.id];
          return { ...p, liked: !wasLiked, likes: newLikes };
        }));
      })
      .catch(() => setLikingId(null));
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditingPostText(post.text);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingPostText("");
  };

  const saveEdit = (index) => {
    const post = postList[index];
    if (!post || !editingPostText.trim()) return;
    updatePost(post.id, { text: editingPostText })
      .then(() => {
        setPostList(prev => prev.map((p, i) => i === index ? { ...p, text: editingPostText } : p));
        cancelEdit();
      })
      .catch(e => console.error("saveEdit error:", e));
  };

  const handleDelete = (index) => {
    const post = postList[index];
    if (!post) return;
    if (!window.confirm("Delete this post?")) return;
    deletePost(post.id)
      .then(() => setPostList(prev => prev.filter((_, i) => i !== index)))
      .catch(e => console.error("handleDelete error:", e));
  };

  const toggleComments = (index) => {
    setCommentsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addComment = async (index) => {
    const text = commentInputs[index]?.trim();
    if (!text) return;
    const post = postList[index];
    if (!post?.id) return;
    const comment = { text, author: user.name, authorId: user.id };
    setPostList(prev => prev.map((p, i) =>
      i === index ? { ...p, comments: [...(p.comments || []), comment] } : p
    ));
    setCommentInputs(prev => ({ ...prev, [index]: "" }));
    try {
      await fbAddComment(post.id, text);
    } catch (e) { console.error("Failed to save comment:", e); }
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
    setPosting(true);
    addPost({ text: newPostText, image: newPostImage })
      .then(postId => {
        const newPost = {
          id: postId,
          text: newPostText,
          image: newPostImage,
          authorName: user.name,
          authorRole: user.role,
          authorPhotoURL: user.photoURL || "",
          likes: [],
          comments: [],
          liked: false,
          createdAt: new Date().toISOString()
        };
        setPostList(prev => [newPost, ...prev]);
        setNewPostText("");
        setNewPostImage(null);
        setPosting(false);
      })
      .catch(e => { console.error("submitPost error:", e); setPosting(false); });
  };

  const filteredMembers = memberFilter === "online" ? memberList.filter(m => m.online) : memberList;

  const openChat = async (contact) => {
    if (!user?.id || !contact?.id || contact.id === user.id) return;
    setChatContact(contact);
    try {
      const convId = await getOrCreateConversation([user.id, contact.id]);
      setChatConvId(convId);
      if (unsubMessagesRef.current) unsubMessagesRef.current();
      markMessagesRead(convId, user.id);
      unsubMessagesRef.current = subscribeMessages(convId, (msgs) => {
        setChatMsgs(msgs.map(m => ({
          id: m.id,
          text: m.text,
          mine: m.senderId === user.id,
          senderName: m.senderName,
          time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          status: m.status || "sent"
        })));
      });
    } catch (e) {
      console.error("Failed to open chat", e);
    }
    setChatOpen(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !chatConvId) return;
    const text = chatInput;
    setChatInput("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      await setTyping(chatConvId, user.id, false);
      await sendMessage(chatConvId, text);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleChatInput = (e) => {
    setChatInput(e.target.value);
    if (!chatConvId || !user?.id) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping(chatConvId, user.id, true);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatConvId, user.id, false);
    }, 2000);
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
                <Avatar $color={user.avatarColor} style={{ width: 40, height: 40, fontSize: "0.8rem", flexShrink: 0 }}>
                  {user.photoURL ? <img src={user.photoURL} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : "U"}
                </Avatar>
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
                    <PostSubmitBtn disabled={!newPostText.trim() || posting} onClick={submitPost}>{posting ? "Posting..." : "Post"}</PostSubmitBtn>
                  </PostActionsRow>
                </div>
              </div>
            </CreatePostCard>
            {postList.map((p, i) => (
              <FeedCard key={i} data-aos="fade-up" data-aos-delay={i * 50}>
                <PostHeader>
                  <Avatar $color={p.avatarColor || "#b50064"}>
                    {p.authorPhotoURL ? <img src={p.authorPhotoURL} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : (p.authorName || p.name || "U").split(" ").map(w => w[0]).join("")}
                  </Avatar>
                  <div>
                    <PostAuthor>{p.authorName || p.name}</PostAuthor>
                    <PostTime>{p.authorRole || p.role} · {p.time || fmtTime(p.createdAt)}</PostTime>
                  </div>
                </PostHeader>
                {editingPostId === p.id ? (
                  <>
                    <PostInput value={editingPostText} onChange={(e) => setEditingPostText(e.target.value)} />
                    <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:8}}>
                      <PostSubmitBtn onClick={() => saveEdit(i)}>Save</PostSubmitBtn>
                      <PostSubmitBtn as="button" onClick={cancelEdit} style={{background:"transparent",color:"inherit",border:"1px solid",opacity:0.6}}>Cancel</PostSubmitBtn>
                    </div>
                  </>
                ) : (
                  <PostText>{p.text}</PostText>
                )}
                {p.image && <PostImagePreview style={{cursor:"pointer"}} onClick={() => setExpandedImage(p.image)}>{typeof p.image === "string" && p.image.startsWith("data:") ? <img src={p.image} alt="Post" /> : <span>📊 Chart Preview</span>}</PostImagePreview>}
                <PostActions>
                  <ActionBtn $active={p.liked ?? (user?.id && (p.likes || []).includes(user.id))} onClick={() => toggleLike(i)}>{(p.liked ?? (user?.id && (p.likes || []).includes(user.id))) ? "❤️" : "🤍"} {p.likes?.length ?? 0}</ActionBtn>
                  <ActionBtn $active={commentsOpen[i]} onClick={() => toggleComments(i)}>💬 {p.comments?.length ?? 0}</ActionBtn>
                  {isPostAuthor(p) && (
                    <>
                      <ActionBtn onClick={() => startEdit(p)}>✏️</ActionBtn>
                      <ActionBtn onClick={() => handleDelete(i)}>🗑️</ActionBtn>
                    </>
                  )}
                </PostActions>
                {commentsOpen[i] && (
                  <CommentSection>
                    {(!p.comments || p.comments.length === 0) && <CommentItem style={{ color: "var(--color-text-secondary, #594048)" }}>No comments yet.</CommentItem>}
                    {(p.comments || []).map((c, j) => (
                      <CommentItem key={j}><CommentAuthor>{c.authorName || c.author || "Anonymous"}</CommentAuthor>{c.text || c}</CommentItem>
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
              <SideCard $variant="chat">
              <SideTitle>💬 Messages</SideTitle>
              {!chatOpen ? (
                conversations.length > 0 ? conversations.map((c, i) => {
                  const otherId = c.participants?.find(id => id !== user.id);
                  const info = otherId ? c.participantInfo?.[otherId] : null;
  if (loading) return (
    <Page>
      <SidebarByRole />
      <Main>
        <LoadingSpinner label="Loading community..." fullHeight />
      </Main>
    </Page>
  );

  return (
                    <ContactRow key={c.id} onClick={() => openChat({ id: otherId, name: info?.name || "Unknown", photoURL: info?.photoURL || "" })}>
                      <Avatar style={{ width: 32, height: 32, fontSize: "0.7rem" }}>{info?.photoURL ? <img src={info.photoURL} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : (info?.name || "?").split(" ").map(w => w[0]).join("")}</Avatar>
                      <ContactName>{info?.name || "Unknown"}</ContactName>
                      <p style={{fontSize:"0.7rem",color:"var(--color-text-secondary, #594048)",flexShrink:0}}>{c.lastMessage?.text ? "💬" : ""}</p>
                    </ContactRow>
                  );
                }) : <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary, #594048)", textAlign: "center", padding: "16px 0" }}>No conversations yet. Click a member to start chatting!</p>
              ) : (
                <ChatBox>
                  <ChatHeader>
                    <BackBtn onClick={() => { setChatOpen(false); setChatContact(null); }}>←</BackBtn>
                    Chatting with {chatContact?.name}
                    <ExpandBtn onClick={() => setChatPopupOpen(true)} title="Expand chat">⛶</ExpandBtn>
                  </ChatHeader>
                  <ChatMessages>
                    {chatMsgs.map((msg, i) => (
                      <ChatMsg key={msg.id || i} $mine={msg.mine}>
                        {msg.text}
                        <ChatTime>
                          {msg.time}
                          {msg.mine && (
                            <span style={{marginLeft:4,fontSize:"0.7rem",color:msg.status === "read" ? "var(--color-primary, #b50064)" : "inherit"}}>
                              {msg.status === "read" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </ChatTime>
                      </ChatMsg>
                    ))}
                    {otherTyping && (
                      <ChatMsg $mine={false} style={{background:"transparent",fontStyle:"italic",opacity:0.6,padding:"4px 14px"}}>
                        {chatContact?.name} is typing...
                      </ChatMsg>
                    )}
                  </ChatMessages>
                  <ChatInputRow>
                    <ChatInput placeholder="Type a message..." value={chatInput} onChange={handleChatInput} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
                    <ChatSend onClick={sendChat}>➤</ChatSend>
                  </ChatInputRow>
                </ChatBox>
              )}
            </SideCard>
            <SideCard $variant="online">
              <SideTitle>👥 Members</SideTitle>
              <FilterRow>
                <FilterTab $active={memberFilter === "all"} onClick={() => setMemberFilter("all")}>All Members</FilterTab>
                <FilterTab $active={memberFilter === "online"} onClick={() => setMemberFilter("online")}>Online Now</FilterTab>
              </FilterRow>
              {filteredMembers.slice(0, visibleMembers).map((m, i) => (
                  <MemberRow key={i} onClick={() => setProfileView(m)}>
                    <Avatar style={{ width: 32, height: 32, fontSize: "0.7rem" }}>
                      {m.photoURL ? <img src={m.photoURL} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : m.name?.split(" ").map(w => w[0]).join("")}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <MemberName>{m.name}</MemberName>
                      <MemberRole>{m.role}</MemberRole>
                    </div>
                    <OnlineDot $online={m.online} />
                  </MemberRow>
                ))}
                {filteredMembers.length > visibleMembers && (
                  <button onClick={() => setVisibleMembers(prev => prev + 15)} style={{background:"none",border:"none",color:"#b50064",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",padding:"8px 0",width:"100%",textAlign:"center"}}>
                    Load more ({filteredMembers.length - visibleMembers} remaining)
                  </button>
                )}
            </SideCard>
            <SideCard $variant="events">
              <SideTitle>📅 Upcoming Events</SideTitle>
              {eventList.map((e, i) => (
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
            <ProfileAvatarLarge>
              {profileView.photoURL ? <img src={profileView.photoURL} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : profileView.name.split(" ").map(w => w[0]).join("")}
            </ProfileAvatarLarge>
            <ProfileNameLarge>{profileView.name}</ProfileNameLarge>
            <ProfileRoleLarge>{profileView.role}</ProfileRoleLarge>
            <ProfileBadge $online={profileView.online}>{profileView.online ? "🟢 Online" : "⚪ Offline"}</ProfileBadge>
            <ProfileActionBtn $primary onClick={() => { openChat(profileView); setProfileView(null); }}>
              💬 Send Message
            </ProfileActionBtn>
          </ProfileCard>
        </ProfilePopup>
      )}
      {chatPopupOpen && chatContact && (
        <ChatPopupOverlay onClick={() => setChatPopupOpen(false)}>
          <ChatPopupCard onClick={(e) => e.stopPropagation()}>
            <ChatHeader>
              <BackBtn onClick={() => setChatPopupOpen(false)}>←</BackBtn>
              Chatting with {chatContact?.name}
              <ExpandBtn onClick={() => setChatPopupOpen(false)} title="Close">✕</ExpandBtn>
            </ChatHeader>
            <ChatMessages style={{ maxHeight: "none", flex: 1 }}>
              {chatMsgs.map((msg, i) => (
                <ChatMsg key={msg.id || i} $mine={msg.mine}>
                  {msg.text}
                  <ChatTime>
                    {msg.time}
                    {msg.mine && (
                      <span style={{marginLeft:4,fontSize:"0.7rem",color:msg.status === "read" ? "var(--color-primary, #b50064)" : "inherit"}}>
                        {msg.status === "read" ? "✓✓" : "✓"}
                      </span>
                    )}
                  </ChatTime>
                </ChatMsg>
              ))}
              {otherTyping && (
                <ChatMsg $mine={false} style={{background:"transparent",fontStyle:"italic",opacity:0.6,padding:"4px 14px"}}>
                  {chatContact?.name} is typing...
                </ChatMsg>
              )}
            </ChatMessages>
            <ChatInputRow>
              <ChatInput placeholder="Type a message..." value={chatInput} onChange={handleChatInput} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
              <ChatSend onClick={sendChat}>➤</ChatSend>
            </ChatInputRow>
          </ChatPopupCard>
        </ChatPopupOverlay>
      )}
      {expandedImage && (
        <div onClick={() => setExpandedImage(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",padding:20}}>
          <img src={expandedImage} alt="Expanded" style={{maxWidth:"95%",maxHeight:"90vh",borderRadius:12,objectFit:"contain",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}} />
          <button onClick={() => setExpandedImage(null)} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:"1.5rem",cursor:"pointer",borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>✕</button>
        </div>
      )}
    </Page>
  );
};
