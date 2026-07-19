import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: ${p => p.$fullHeight ? "400px" : "auto"};
  animation: ${fadeIn} 0.2s ease;
`;

const SpinnerRing = styled.div`
  width: ${p => p.$size || 40}px;
  height: ${p => p.$size || 40}px;
  border: 3px solid #f0e6ef;
  border-top-color: #b50064;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`;

const Label = styled.p`
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
  margin: 0;
`;

export const LoadingSpinner = ({ label = "Loading...", fullHeight = false, size = 40 }) => (
  <Overlay $fullHeight={fullHeight}>
    <SpinnerRing $size={size} />
    {label && <Label>{label}</Label>}
  </Overlay>
);

export default LoadingSpinner;
