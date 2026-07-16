import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../firebase/auth";
import { getAllPendingPayments, verifyPayment, rejectPayment } from "../../firebase/db";
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

const PaymentCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  margin-bottom: 16px;
  border-left: 5px solid ${(props) => props.theme.colors.primary};
`;

const PaymentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const PaymentLabel = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 600;
`;

const PaymentValue = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 500;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const VerifyBtn = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: #2e7d32;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
  flex: 1;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const RejectBtn = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #e53935;
  background: transparent;
  color: #e53935;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  flex: 1;
  &:hover { background: #e53935; color: #fff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px dashed #ddd;
`;

export default function AdminBillingVerify() {
  const navigate = useNavigate();
  const user = getStoredUser() || { name: "Admin" };
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => { AOS.init({ once: true }); }, []);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    setLoading(true);
    getAllPendingPayments()
      .then(data => setPayments(data))
      .catch(e => console.error("getAllPendingPayments error:", e))
      .finally(() => setLoading(false));
  };

  const handleVerify = async (userId) => {
    setProcessing(userId);
    try {
      await verifyPayment(userId, user.id, user.name);
      setPayments(prev => prev.filter(p => p.userId !== userId));
    } catch (err) {
      console.error("verifyPayment error:", err);
      alert("Failed to verify payment.");
    }
    setProcessing(null);
  };

  const handleReject = async (userId) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;
    setProcessing(userId);
    try {
      await rejectPayment(userId, user.id, user.name);
      setPayments(prev => prev.filter(p => p.userId !== userId));
    } catch (err) {
      console.error("rejectPayment error:", err);
      alert("Failed to reject payment.");
    }
    setProcessing(null);
  };

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Page>
      <Main>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#b50064", fontWeight: 600 }}>← Back</button>
        </div>
        <div>
          <PageTitle data-aos="fade-down">🔍 Verify Payments</PageTitle>
          <p style={{ color: "#594048", fontSize: "0.9rem", marginTop: 4 }}>Review and verify pending payment submissions.</p>
        </div>

        <div style={{ marginTop: 24 }}>
          {loading ? (
            <p style={{ color: "#594048", textAlign: "center", padding: 40 }}>Loading payments...</p>
          ) : payments.length === 0 ? (
            <EmptyState data-aos="fade-up">
              <p style={{ fontSize: "2rem", marginBottom: 8 }}>✅</p>
              <p style={{ fontWeight: 600, color: "#2c3e50", marginBottom: 4 }}>No pending payments</p>
              <p style={{ fontSize: "0.85rem", color: "#594048" }}>All payment submissions have been reviewed.</p>
            </EmptyState>
          ) : (
            payments.map((p, i) => (
              <PaymentCard key={p.id || i} data-aos="fade-up">
                <PaymentRow>
                  <div>
                    <PaymentLabel>Admin</PaymentLabel>
                    <PaymentValue>{p.userName}</PaymentValue>
                  </div>
                  <div>
                    <PaymentLabel>Email</PaymentLabel>
                    <PaymentValue>{p.userEmail}</PaymentValue>
                  </div>
                </PaymentRow>
                <PaymentRow>
                  <div>
                    <PaymentLabel>Amount</PaymentLabel>
                    <PaymentValue style={{ fontSize: "1.1rem", fontWeight: 700, color: "#b50064" }}>${p.amount}</PaymentValue>
                  </div>
                  <div>
                    <PaymentLabel>Method</PaymentLabel>
                    <PaymentValue style={{ textTransform: "capitalize" }}>{p.paymentMethod}</PaymentValue>
                  </div>
                </PaymentRow>
                <PaymentRow>
                  <div>
                    <PaymentLabel>Reference</PaymentLabel>
                    <PaymentValue style={{ fontFamily: "monospace", background: "#f5f5f5", padding: "4px 8px", borderRadius: 4 }}>{p.reference}</PaymentValue>
                  </div>
                  <div>
                    <PaymentLabel>Submitted</PaymentLabel>
                    <PaymentValue>{formatDate(p.createdAt)}</PaymentValue>
                  </div>
                </PaymentRow>
                <BtnRow>
                  <VerifyBtn onClick={() => handleVerify(p.userId)} disabled={processing === p.userId}>
                    {processing === p.userId ? "Processing..." : "✓ Verify Payment"}
                  </VerifyBtn>
                  <RejectBtn onClick={() => handleReject(p.userId)} disabled={processing === p.userId}>
                    ✕ Reject
                  </RejectBtn>
                </BtnRow>
              </PaymentCard>
            ))
          )}
        </div>
      </Main>
    </Page>
  );
}
