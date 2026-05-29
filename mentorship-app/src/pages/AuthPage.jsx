// AuthPage with role selection and extra registration fields
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import lottie from "lottie-web";
import { useNavigate } from "react-router-dom";

// Lottie placeholder animation URL
const LOTTIE_URL = "https://assets-v2.lottiefiles.com/a/7400555a-117b-11ee-b7a8-3f5a379facbf/MaoSbTwAlQ.json";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("mentee");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });

  const lottieRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Lottie animation once
  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: lottieRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: LOTTIE_URL,
    });
    return () => anim.destroy();
  }, []);

  // GSAP entrance animation for form fields
  useEffect(() => {
    if (!formRef.current) return;
    const elements = formRef.current.children;
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      if (isLogin) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });
        if (!res.ok) {
          const err = await res.json();
          setAuthMessage({ text: err.message || "Login failed", type: "error" });
          return;
        }
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        const userRole = data.user.role;
        if (userRole !== "admin" && !data.user.verified) {
          setAuthMessage({ text: "Your account is pending verification by an administrator. You will be able to log in once approved.", type: "warning" });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return;
        }
      } else {
        if (password !== confirmPassword) {
          setAuthMessage({ text: "Passwords do not match", type: "error" });
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email,
            password,
            role,
            phone,
            city,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          setAuthMessage({ text: err.message || "Registration failed", type: "error" });
          return;
        }
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        if (role !== "admin") {
          setAuthMessage({ text: "Registration successful! Your account is pending verification by an administrator. You will be able to log in once approved.", type: "warning" });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return;
        }
      }
      setAuthMessage({ text: "", type: "" });
      navigate(`/dashboard/${role}`);
    } catch {
      setAuthMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  return (
    <PageContainer>
      <GraphicSide>
        <LottieContainer ref={lottieRef} />
        <div style={{ alignSelf: "stretch" }}>
          <h1 style={{ fontSize: "2.5rem", textAlign: "left", marginBottom: "0.5rem" }}>
            Empower Your Journey
          </h1>
          <p style={{ textAlign: "left", opacity: 0.9, maxWidth: "80%", margin: 0 }}>
            Connect with mentors, track your progress, and achieve your goals with the Vibrant Mentorship System.
          </p>
        </div>
      </GraphicSide>

      <FormSide>
        <FormBox compact={isLogin}>
          <form onSubmit={handleSubmit} ref={formRef}>
            <Title>{isLogin ? "Welcome Back" : "Create an Account"}</Title>

            {/* Role toggle – visible on both login and registration */}
            <InputGroup>
              <label>I am a</label>
              <RoleToggle role="radiogroup" aria-label="Select your role">
                {[
                  { value: "mentee", label: "Mentee" },
                  { value: "mentor", label: "Mentor" },
                  { value: "admin", label: "Admin" },
                ].map(({ value, label }) => (
                  <RolePill
                    key={value}
                    as="button"
                    type="button"
                    role="radio"
                    aria-checked={role === value}
                    active={role === value}
                    onClick={() => setRole(value)}
                  >
                    {label}
                  </RolePill>
                ))}
              </RoleToggle>
            </InputGroup>

            {/* Two-column registration form */}
            {!isLogin ? (
              <FormColumns>
                <Column>
                  <InputGroup>
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <label>Telephone</label>
                    <input
                      type="tel"
                      placeholder="+1 555‑123‑4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="you@example.com" required />
                  </InputGroup>
                </Column>
                <Column>
                  <InputGroup>
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="Your city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <label>Password</label>
                    <PasswordWrapper>
                      <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required />
                      <ToggleVis type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? EyeOff : EyeOn}
                      </ToggleVis>
                    </PasswordWrapper>
                  </InputGroup>
                  <InputGroup>
                    <label>Confirm Password</label>
                    <PasswordWrapper>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <ToggleVis type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                        {showConfirmPassword ? EyeOff : EyeOn}
                      </ToggleVis>
                    </PasswordWrapper>
                  </InputGroup>
                </Column>
              </FormColumns>
            ) : (
              <>
                <InputGroup>
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="you@example.com" required />
                </InputGroup>
                <InputGroup>
                  <label>Password</label>
                  <PasswordWrapper>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required />
                    <ToggleVis type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? EyeOff : EyeOn}
                    </ToggleVis>
                  </PasswordWrapper>
                </InputGroup>
                <ForgotLink type="button" onClick={() => setShowResetModal(true)}>
                  Forgot password?
                </ForgotLink>
              </>
            )}

            <SubmitButton type="submit">{isLogin ? "Sign In" : "Register"}</SubmitButton>

            {authMessage.text && (
              <p style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600,
                background: authMessage.type === "error" ? "#e5393515" : authMessage.type === "warning" ? "#f57f1715" : "#2e7d3215",
                color: authMessage.type === "error" ? "#e53935" : authMessage.type === "warning" ? "#f57f17" : "#2e7d32",
                textAlign: "center",
              }}>{authMessage.text}</p>
            )}

            {showResetModal && (
              <Overlay onClick={() => { setShowResetModal(false); setResetSent(false); }}>
                <ResetModal onClick={(e) => e.stopPropagation()}>
                  <ResetTitle>Reset Password</ResetTitle>
                  {resetSent ? (
                    <>
                      <p style={{ marginBottom: "1rem", color: "var(--theme-text-secondary, #594048)" }}>
                        If an account exists for <strong>{resetEmail}</strong>, a reset link has been sent.
                      </p>
                      <SubmitButton type="button" onClick={() => { setShowResetModal(false); setResetSent(false); }}>
                        Done
                      </SubmitButton>
                    </>
                  ) : (
                    <>
                      <p style={{ marginBottom: "1rem", color: "var(--theme-text-secondary, #594048)" }}>
                        Enter your email and we'll send you a password reset link.
                      </p>
                      <InputGroup>
                        <label>Email Address</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </InputGroup>
                      <ModalActions>
                        <CancelButton type="button" onClick={() => { setShowResetModal(false); setResetSent(false); }}>
                          Cancel
                        </CancelButton>
                        <SendButton
                          type="button"
                          onClick={async () => {
                            if (!resetEmail) return;
                            await fetch("/api/auth/forgot-password", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: resetEmail }),
                            });
                            setResetSent(true);
                          }}
                        >
                          Send Reset Link
                        </SendButton>
                      </ModalActions>
                    </>
                  )}
                </ResetModal>
              </Overlay>
            )}

            <ToggleText>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => { setIsLogin(!isLogin); setAuthMessage({ text: "", type: "" }); }}>
                {isLogin ? "Sign up here" : "Log in here"}
              </span>
            </ToggleText>
          </form>
        </FormBox>
      </FormSide>
    </PageContainer>
  );
};

// Styled components (unchanged from previous versions)
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.colors.background};
`;

const GraphicSide = styled.div`
  flex: 1;
  background-color: ${(props) => props.theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  padding: ${(props) => props.theme.spacing.xl};
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const LottieContainer = styled.div`
  width: 80%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 100% !important;
    height: 100% !important;
  }
`;

const FormSide = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.lg};
`;

const FormBox = styled.div`
  width: 100%;
  max-width: ${({ compact }) => (compact ? "400px" : "560px")};
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  margin-bottom: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
  label {
    display: block;
    margin-bottom: ${(props) => props.theme.spacing.xs};
    font-size: 0.875rem;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textSecondary};
  }
  input,
  select {
    width: 100%;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.colors.outline};
    border-radius: ${(props) => props.theme.borderRadius};
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.2s ease;
    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.colors.secondary};
      box-shadow: 0 0 0 3px rgba(0, 101, 144, 0.1);
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${(props) => props.theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: ${(props) => props.theme.spacing.sm};
  &:hover {
    background-color: ${(props) => props.theme.colors.primaryContainer};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 32, 126, 0.3);
  }
`;

const EyeOn = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const PasswordWrapper = styled.div`
  position: relative;
  input {
    padding-right: 44px;
  }
`;

const ToggleVis = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.secondary};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${(props) => props.theme.spacing.lg};
`;

const ResetModal = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius};
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
`;

const ResetTitle = styled.h3`
  margin-bottom: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.md};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 50px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
`;

const SendButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${(props) => props.theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.colors.primaryContainer};
  }
`;

const FormColumns = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.lg};
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: 0;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 0;
`;

const ForgotLink = styled.button`
  display: block;
  margin-left: auto;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  background: none;
  border: none;
  padding: 4px 0;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.secondary};
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
  &:hover {
    opacity: 0.8;
  }
  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.secondary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const RoleToggle = styled.div`
  display: flex;
  gap: 0;
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: ${(props) => props.theme.borderRadius};
  overflow: hidden;
`;

const RolePill = styled.button`
  flex: 1;
  padding: 10px 8px;
  border: none;
  background: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
  color: ${(props) =>
    props.active
      ? props.theme.colors.surface
      : props.theme.colors.textSecondary};
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) =>
      props.active
        ? props.theme.colors.primary
        : props.theme.colors.background};
  }
  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.secondary};
    outline-offset: -2px;
  }
`;

const ToggleText = styled.p`
  margin-top: ${(props) => props.theme.spacing.lg};
  text-align: center;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};
  span {
    color: ${(props) => props.theme.colors.secondary};
    font-weight: 600;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;
