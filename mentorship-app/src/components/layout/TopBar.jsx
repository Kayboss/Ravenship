import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { logout, getStoredUser } from "../../firebase/auth";

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  margin-bottom: 24px;
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    height: 64px;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 50px;
  padding: 8px 20px;
  width: 320px;
  input {
    border: none;
    background: transparent;
    margin-left: 12px;
    font-family: inherit;
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.textPrimary};
    width: 100%;
    outline: none;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: 160px;
    padding: 6px 14px;
    input { font-size: 0.8rem; }
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    width: auto;
    flex: 1;
    min-width: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${(props) => props.$active ? props.theme.colors.surface : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  position: relative;
  transition: all 0.2s;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
    background: ${(props) => props.theme.colors.surface};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e53935;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.colors.primary};
  overflow: hidden;
  background: ${(props) => props.theme.colors.primaryContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.primary};
  transition: all 0.2s;
  &:hover { opacity: 0.8; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 16px 20px 12px;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${(props) => props.theme.colors.textPrimary};
  border-bottom: 1px solid ${(props) => props.theme.colors.outline};
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${(props) => props.theme.colors.background}; }
  &:not(:last-child) { border-bottom: 1px solid ${(props) => props.theme.colors.outline}40; }
`;

const DropdownIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
`;

const DropdownText = styled.div`
  flex: 1;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.4;
`;

const ReplyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textPrimary};
  outline: none;
  box-sizing: border-box;
  margin-top: 8px;
  &:focus { border-color: ${(props) => props.theme.colors.primary}; }
`;

const ReplyRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
`;

const ReplyBtn = styled.button`
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background: ${(props) => props.theme.colors.primary}15;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: ${(props) => props.theme.colors.primary}25; }
`;

const ReplySend = styled(ReplyBtn)`
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
`;

const ReplyText = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 4px;
  padding: 4px 8px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 6px;
`;

const DropdownTime = styled.span`
  font-size: 0.7rem;
  color: ${(props) => props.theme.colors.textSecondary};
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProfileDropdown = styled(Dropdown)`
  width: 220px;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline};
`;

const ProfileAvatarSm = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
`;

const ProfileDropdownHeader = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ProfileEmail = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ProfileMenuItem = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px 20px;
  text-align: left;
  font-family: inherit;
  font-size: 0.85rem;
  color: ${(props) => props.$danger ? "#e53935" : props.theme.colors.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.15s;
  &:hover { background: ${(props) => props.theme.colors.background}; }
`;

const RelativeWrap = styled.div`
  position: relative;
`;

const defaultNotifications = [
  { icon: "✅", text: "Your Design System Audit has been reviewed. Grade: 92/100", time: "5m ago" },
  { icon: "📝", text: "New assignment posted: User Research Synthesis Report", time: "1h ago" },
  { icon: "💬", text: "Mentor Marcus left feedback on your wireframes", time: "3h ago" },
  { icon: "🎯", text: "You've reached 75% completion in Advanced UI/UX", time: "1d ago" },
  { icon: "📅", text: "Reminder: Live Q&A session tomorrow at 3 PM", time: "1d ago" },
];

const defaultMessages = [
  { icon: "👤", name: "Marcus Chen", text: "Great work on the wireframes! Let's refine the...", time: "2m ago", replies: ["Looks good, will review tonight"] },
  { icon: "👤", name: "Aisha Patel", text: "The Q3 data analysis is ready for review", time: "1h ago", replies: [] },
  { icon: "👤", name: "Dr. Sarah Jenkins", text: "Don't forget the user research due Friday", time: "4h ago", replies: ["Noted, thanks!"] },
];

export const TopBar = ({ searchPlaceholder = "Search..." }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const loadMessages = () => {
    try { const d = localStorage.getItem("topbar_messages"); if (d === null) return defaultMessages; return JSON.parse(d); } catch { return defaultMessages; }
  };
  const loadNotifications = () => {
    try { const d = localStorage.getItem("topbar_notifications"); if (d === null) return defaultNotifications; return JSON.parse(d); } catch { return defaultNotifications; }
  };

  const [messageList, setMessageList] = useState(loadMessages);
  const [notificationList, setNotificationList] = useState(loadNotifications);
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshFromStorage = () => {
    setMessageList(loadMessages());
    setNotificationList(loadNotifications());
    setRefreshTick(t => t + 1);
  };

  const unreadMsgs = (() => { try { const d = localStorage.getItem("topbar_unread_messages"); if (d === null) return messageList.length; return parseInt(d, 10); } catch { return messageList.length; } })();
  const unreadNotifs = (() => { try { const d = localStorage.getItem("topbar_unread_notifications"); if (d === null) return notificationList.length; return parseInt(d, 10); } catch { return notificationList.length; } })();
  const navigate = useNavigate();
  const { role } = useParams();
  const ref = useRef(null);
  const didMount = useRef(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (openDropdown === null) {
      localStorage.setItem("topbar_notifications", "[]");
      localStorage.setItem("topbar_unread_notifications", "0");
      localStorage.setItem("topbar_messages", "[]");
      localStorage.setItem("topbar_unread_messages", "0");
    }
  }, [openDropdown]);

  const user = getStoredUser() || { name: "User", email: "" };

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  const currentRole = role || user.role || "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Bar>
      <SearchWrapper>
        <span>🔍</span>
        <input placeholder={searchPlaceholder} />
      </SearchWrapper>
      <HeaderActions ref={ref}>
        <RelativeWrap>
          <IconBtn $active={openDropdown === "notifications"} onClick={() => { refreshFromStorage(); setOpenDropdown(openDropdown === "notifications" ? null : "notifications"); }}>
            🔔{unreadNotifs > 0 ? <Badge>{unreadNotifs}</Badge> : null}
          </IconBtn>
          {openDropdown === "notifications" && notificationList.length > 0 && (
            <Dropdown>
              <DropdownHeader>Notifications</DropdownHeader>
              {notificationList.map((n, i) => (
                <DropdownItem key={i}>
                  <DropdownIcon>{n.icon}</DropdownIcon>
                  <DropdownText>{n.text}</DropdownText>
                  <DropdownTime>{n.time}</DropdownTime>
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </RelativeWrap>

        <RelativeWrap>
          <IconBtn $active={openDropdown === "messages"} onClick={() => { refreshFromStorage(); setOpenDropdown(openDropdown === "messages" ? null : "messages"); }}>
            ✉️{unreadMsgs > 0 ? <Badge>{unreadMsgs}</Badge> : null}
          </IconBtn>
          {openDropdown === "messages" && messageList.length > 0 && (
            <Dropdown>
              <DropdownHeader>Messages</DropdownHeader>
              {messageList.map((m, i) => (
                <DropdownItem key={i}>
                  <DropdownIcon>{m.icon}</DropdownIcon>
                  <DropdownText><strong>{m.name}</strong></DropdownText>
                  <DropdownTime>{m.time}</DropdownTime>
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </RelativeWrap>

        <IconBtn onClick={() => navigate(`/dashboard/${currentRole}/settings`)}>⚙️</IconBtn>

        <RelativeWrap>
          <Avatar onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}>
            {initials}
          </Avatar>
          {openDropdown === "profile" && (
            <ProfileDropdown>
              <ProfileRow>
                <ProfileAvatarSm>{initials}</ProfileAvatarSm>
                <ProfileDropdownHeader>
                  <ProfileName>{user.name}</ProfileName>
                  <ProfileEmail>{user.email}</ProfileEmail>
                </ProfileDropdownHeader>
              </ProfileRow>
              <ProfileMenuItem onClick={() => { setOpenDropdown(null); navigate(`/dashboard/${currentRole}/settings`); }}>
                ⚙️ Settings
              </ProfileMenuItem>
              <ProfileMenuItem $danger onClick={handleLogout}>
                🚪 Sign Out
              </ProfileMenuItem>
            </ProfileDropdown>
          )}
        </RelativeWrap>
      </HeaderActions>
    </Bar>
  );
};