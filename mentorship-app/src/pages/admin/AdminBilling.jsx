import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../firebase/auth";
import { getActivitiesPaginated } from "../../firebase/db";
import { Card, CardTitle } from "./adminStyles";

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
  @media (max-width: 640px) {
    font-size: 1.3rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
  @media (max-width: 640px) { gap: 16px; margin-top: 16px; }
`;

const PlaceholderCard = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px dashed #ddd;
`;

export default function AdminBilling() {
  const navigate = useNavigate();
  const user = getStoredUser() || { name: "Admin" };

  useEffect(() => { AOS.init({ once: true }); }, []);

  return (
    <Page>
      <style>{`
        @media(max-width:480px){.desktop-only{display:none!important}}
      `}</style>
      <Main>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#b50064", fontWeight: 600 }}>← Back</button>
        </div>
        <div>
          <PageTitle data-aos="fade-down">💳 Billing & Subscription</PageTitle>
          <p style={{ color: "#594048", fontSize: "0.9rem", marginTop: 4 }}>Manage your organization's subscription and payment history.</p>
        </div>

        <Grid>
          <Card data-aos="fade-up">
            <CardTitle>📋 Current Plan</CardTitle>
            <div style={{ padding: "20px 0" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#b50064", marginBottom: 8 }}>$135<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#594048" }}>/year</span></div>
              <p style={{ color: "#594048", fontSize: "0.85rem", marginBottom: 16 }}>Yearly billing plan for your organization.</p>
              <div style={{ padding: "12px 16px", background: "#fff3cd", borderRadius: 8, border: "1px solid #ffc107" }}>
                <p style={{ color: "#856404", fontSize: "0.85rem", fontWeight: 600 }}>🚧 Coming Soon</p>
                <p style={{ color: "#856404", fontSize: "0.8rem", marginTop: 4 }}>Payment features will be available here.</p>
              </div>
            </div>
          </Card>

          <Card data-aos="fade-up">
            <CardTitle>📊 Payment History</CardTitle>
            <PlaceholderCard>
              <p style={{ fontSize: "2rem", marginBottom: 8 }}>📄</p>
              <p style={{ fontWeight: 600, color: "#2c3e50", marginBottom: 4 }}>No payments yet</p>
              <p style={{ fontSize: "0.85rem", color: "#594048" }}>Your payment history will appear here.</p>
            </PlaceholderCard>
          </Card>
        </Grid>
      </Main>
    </Page>
  );
}
