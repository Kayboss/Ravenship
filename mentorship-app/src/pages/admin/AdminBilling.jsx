import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../firebase/auth";
import { submitPayment, getBillingStatus, checkOrganizationBilling } from "../../firebase/db";
import { Card, CardTitle } from "./adminStyles";
import { logger } from "../../lib/logger";
import { toast } from "../../lib/notify";

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

const FieldLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary};
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const SubmitBtn = styled.button`
  padding: 12px 32px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
  width: 100%;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 640px) {
    padding: 14px 24px;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${(props) => {
    if (props.$status === "verified") return "#2e7d3220";
    if (props.$status === "pending") return "#ff980020";
    return "#e5393520";
  }};
  color: ${(props) => {
    if (props.$status === "verified") return "#2e7d32";
    if (props.$status === "pending") return "#ff9800";
    return "#e53935";
  }};
`;

const SuccessMsg = styled.div`
  padding: 12px 20px;
  border-radius: 12px;
  background: #2e7d3220;
  color: #2e7d32;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 16px;
`;

export default function AdminBilling() {
  const navigate = useNavigate();
  const user = getStoredUser() || { name: "Admin" };
  const [billing, setBilling] = useState(null);
  const [orgBilling, setOrgBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("1485");

  useEffect(() => { AOS.init({ once: true }); }, []);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getBillingStatus(user.id).catch(() => null),
      checkOrganizationBilling().catch(() => ({ active: false })),
    ]).then(([myBilling, org]) => {
      setBilling(myBilling);
      setOrgBilling(org);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setSubmitting(true);
    try {
      await submitPayment({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        paymentMethod,
        reference: reference.trim(),
        amount: Number(amount) || 135,
      });
      setSuccess(true);
      setReference("");
      setTimeout(() => setSuccess(false), 4000);
      const updated = await getBillingStatus(user.id);
      setBilling(updated);
    } catch (err) {
      logger.error("submitPayment error:", err);
      toast.error("Failed to submit payment. Please try again.");
    }
    setSubmitting(false);
  };

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isVerified = billing?.status === "verified";
  const isPending = billing?.status === "pending";
  const isExpired = billing?.expiryDate && new Date(billing.expiryDate?.toDate ? billing.expiryDate.toDate() : billing.expiryDate) < new Date();
  const orgActive = orgBilling?.active;
  const orgExpiry = orgBilling?.expiryDate;
  const orgAdminName = orgBilling?.adminName;

  return (
    <div>
      <div>
        <PageTitle data-aos="fade-down">💳 Billing & Subscription</PageTitle>
        <p style={{ color: "#594048", fontSize: "0.9rem", marginTop: 4 }}>Manage your organization's subscription and payment.</p>
      </div>

      {success && <SuccessMsg data-aos="fade">✓ Payment submitted successfully! Awaiting verification.</SuccessMsg>}

      <Grid>
        <Card data-aos="fade-up">
          <CardTitle>📋 Current Plan</CardTitle>
          <div style={{ padding: "20px 0" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#b50064", marginBottom: 8 }}><span style={{ fontSize: "1.2rem" }}>₵</span>1,485<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#594048" }}>/year</span></div>
            <p style={{ color: "#594048", fontSize: "0.85rem", marginBottom: 16 }}>Yearly billing plan for your organization.</p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: "0.85rem", color: "#594048" }}>Status:</span>
              {loading ? (
                <span style={{ fontSize: "0.85rem", color: "#999" }}>Loading...</span>
              ) : orgActive ? (
                <StatusBadge $status="verified">Active</StatusBadge>
              ) : billing ? (
                <StatusBadge $status={isExpired ? "expired" : billing.status}>
                  {isExpired ? "Expired" : billing.status === "verified" ? "Active" : "Pending Review"}
                </StatusBadge>
              ) : (
                <StatusBadge $status="expired">No Subscription</StatusBadge>
              )}
            </div>

            {orgActive && orgExpiry && (
              <p style={{ fontSize: "0.8rem", color: "#2e7d32", fontWeight: 600 }}>
                Subscription active until {new Date(orgExpiry).toLocaleDateString()}{orgAdminName ? ` (paid by ${orgAdminName})` : ""}.
              </p>
            )}

            {!orgActive && billing?.expiryDate && (
              <p style={{ fontSize: "0.8rem", color: isExpired ? "#c62828" : "#594048", fontWeight: isExpired ? 600 : 400 }}>
                Expires: {new Date(billing.expiryDate?.toDate ? billing.expiryDate.toDate() : billing.expiryDate).toLocaleDateString()}
              </p>
            )}

            {!orgActive && billing?.startDate && (
              <p style={{ fontSize: "0.8rem", color: "#594048", marginTop: 4 }}>
                Started: {new Date(billing.startDate?.toDate ? billing.startDate.toDate() : billing.startDate).toLocaleDateString()}
              </p>
            )}

            {!orgActive && isExpired && (
              <div style={{ padding: "12px 16px", background: "#ffebee", borderRadius: 8, border: "1px solid #e53935", marginTop: 8 }}>
                <p style={{ color: "#c62828", fontSize: "0.85rem", fontWeight: 600 }}>⚠️ Subscription Expired</p>
                <p style={{ color: "#c62828", fontSize: "0.8rem", marginTop: 4 }}>Please renew to continue full access.</p>
              </div>
            )}
          </div>
        </Card>

        <Card data-aos="fade-up">
          <CardTitle>💰 Submit Payment</CardTitle>
          {orgActive ? (
            <div style={{ padding: "20px 0" }}>
              <div style={{ padding: "16px", background: "#e8f5e9", borderRadius: 8, border: "1px solid #2e7d32", marginBottom: 16 }}>
                <p style={{ color: "#2e7d32", fontSize: "0.85rem", fontWeight: 600 }}>✅ Organization Subscription Active</p>
                <p style={{ color: "#2e7d32", fontSize: "0.8rem", marginTop: 4 }}>Another admin has already paid for the organization subscription. No payment needed from you.</p>
              </div>
            </div>
          ) : isPending ? (
            <div style={{ padding: "20px 0" }}>
              <div style={{ padding: "16px", background: "#fff3cd", borderRadius: 8, border: "1px solid #ffc107", marginBottom: 16 }}>
                <p style={{ color: "#856404", fontSize: "0.85rem", fontWeight: 600 }}>⏳ Payment Under Review</p>
                <p style={{ color: "#856404", fontSize: "0.8rem", marginTop: 4 }}>Your payment is being verified. This usually takes 1-2 business days.</p>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#594048" }}>
                <p><strong>Reference:</strong> {billing.reference}</p>
                <p><strong>Method:</strong> {billing.paymentMethod}</p>
                <p><strong>Submitted:</strong> {formatDate(billing.createdAt)}</p>
              </div>
            </div>
          ) : isVerified && !isExpired ? (
            <div style={{ padding: "20px 0" }}>
              <div style={{ padding: "16px", background: "#e8f5e9", borderRadius: 8, border: "1px solid #2e7d32" }}>
                <p style={{ color: "#2e7d32", fontSize: "0.85rem", fontWeight: 600 }}>✅ Subscription Active</p>
                <p style={{ color: "#2e7d32", fontSize: "0.8rem", marginTop: 4 }}>Your subscription is active until {new Date(billing.expiryDate?.toDate ? billing.expiryDate.toDate() : billing.expiryDate).toLocaleDateString()}.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "20px 0" }}>
              <p style={{ fontSize: "0.85rem", color: "#594048", marginBottom: 16 }}>Make payment and submit your reference number for verification.</p>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Payment Amount</FieldLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="135"
                  min="1"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Payment Method</FieldLabel>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="momo">Mobile Money (MoMo)</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Reference Number</FieldLabel>
                <Input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter transaction/reference number"
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}>Enter the reference or transaction ID from your payment.</p>
              </div>

              <SubmitBtn type="submit" disabled={submitting || !reference.trim()}>
                {submitting ? "Submitting..." : "Submit Payment"}
              </SubmitBtn>
            </form>
          )}
        </Card>
      </Grid>
    </div>
  );
}
