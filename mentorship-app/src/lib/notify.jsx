// src/lib/notify.jsx
// Lightweight toast system replacing native alert() calls. Provides both a
// hook (useToast) for components and a module-level `toast` singleton for
// utility modules (e.g. upload.js) that cannot call hooks.
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";

const ToastContext = createContext({ success: () => {}, error: () => {}, info: () => {} });

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
  pointer-events: none;
`;

const ToastBox = styled.div`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  animation: ${slideIn} 0.2s ease;
  background: ${({ $type }) =>
    $type === "success" ? "#2e7d32" : $type === "error" ? "#c62828" : "#006590"};
`;

let emit = null;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  emit = push;

  const api = useMemo(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info"),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Container>
        {toasts.map((t) => (
          <ToastBox key={t.id} $type={t.type}>
            {t.message}
          </ToastBox>
        ))}
      </Container>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export const toast = {
  success: (message) => emit?.(message, "success"),
  error: (message) => emit?.(message, "error"),
  info: (message) => emit?.(message, "info"),
};
