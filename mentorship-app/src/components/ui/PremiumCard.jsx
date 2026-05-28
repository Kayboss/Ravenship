// src/components/ui/PremiumCard.js
import React from "react";
import styled, { css } from "styled-components";

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 2px solid ${(props) => props.theme.colors.accent};
  border-radius: ${(props) => props.theme.borderRadius};
  padding: ${(props) => props.theme.spacing.md};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform ${(props) => props.theme.transition},
    box-shadow ${(props) => props.theme.transition},
    background ${(props) => props.theme.transition};
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    background: ${(props) => props.theme.colors.background};
  }
`;

const Title = styled.h2`
  font-size: ${(props) => props.theme.typography.heading2};
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const Body = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize};
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const PremiumCard = ({ title, children }) => (
  <Card>
    <Title>{title}</Title>
    <Body>{children}</Body>
  </Card>
);
