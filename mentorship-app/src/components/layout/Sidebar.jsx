import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { logout, getStoredUser } from "../../firebase/auth";

const SidebarContainer = styled.nav`
  width: 280px;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.surface};
  border-right: 1px solid ${(props) => props.theme.colors.outline};
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${(props) => props.theme.colors.outline};
`;

const ProfileAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primaryContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 3px solid ${(props) => props.theme.colors.primary}40;
`;

const ProfileName = styled.p`
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
`;

const ProfilePhone = styled.p`
  font-size: 0.78rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin-top: 2px;
`;

const NavList = styled.ul`
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: ${(props) => (props.$active ? props.theme.colors.primaryContainer : "transparent")};
  color: ${(props) => (props.$active ? "white" : props.theme.colors.textSecondary)};
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primaryContainer : props.theme.colors.background)};
    color: ${(props) => (props.$active ? "white" : props.theme.colors.primary)};
  }
`;

const FooterSection = styled.div`
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 1px solid ${(props) => props.theme.colors.outline};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FooterBtn = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const navItems = [
  { label: "Dashboard",     path: "/dashboard/admin",              icon: "⚙️" },
  { label: "Mentors",       path: "/dashboard/admin#mentors",      icon: "👤" },
  { label: "Mentees",       path: "/dashboard/admin#mentees",      icon: "👥" },
  { label: "Gradebook",     path: "/dashboard/admin#gradebook",    icon: "📋" },
  { label: "Community",     path: "/dashboard/admin/community",    icon: "👥" },
  { label: "Notifications", path: "/dashboard/admin#notifications", icon: "🔔" },
  { label: "Help Center",   path: "/dashboard/admin#help",         icon: "❓" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();
  const currentRole = role || "admin";

  const user = getStoredUser() || { name: "User", phone: "" };

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <SidebarContainer>
      <ProfileSection>
        <ProfileAvatar>{initials}</ProfileAvatar>
        <ProfileName>{user.name}</ProfileName>
        <ProfilePhone>{user.phone || "No phone"}</ProfilePhone>
      </ProfileSection>
      <NavList>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavButton
              $active={item.path.includes("#")
                ? location.pathname + location.hash === item.path
                : location.pathname === item.path && !location.hash}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavButton>
          </li>
        ))}
      </NavList>
      <FooterSection>
        <FooterBtn onClick={handleLogout}>
          🚪 Logout
        </FooterBtn>
      </FooterSection>
    </SidebarContainer>
  );
};
