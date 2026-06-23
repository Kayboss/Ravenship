import emailjs from "@emailjs/browser";

// ── EmailJS Configuration ──
// 1. Sign up at https://www.emailjs.com/ (free tier: 200 emails/month)
// 2. Go to Email Services → Add a service (Gmail, Outlook, etc.)
// 3. Go to Email Templates → Create three templates (paste the HTML below into the "Content" tab, use "Code" mode):
//    Template A ("welcome"): variables → {{to_name}}, {{to_email}}, {{user_name}}, {{user_role}}
//    Template B ("admin_notify"): variables → {{admin_name}}, {{admin_email}}, {{user_name}}, {{user_email}}, {{user_role}}
//    Template C ("approved"): variables → {{to_name}}, {{to_email}}, {{user_name}}, {{user_role}}
// 4. Copy your Public Key (Account → API Keys), Service ID, and Template IDs below
//
// ── TEMPLATE A: Welcome Email (HTML to paste in EmailJS) ──
// <!DOCTYPE html>
// <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
// <style>@media(max-width:480px){.inner{padding:24px 20px!important}.header{padding:32px 20px!important}.footer{padding:16px 20px!important}.btn{display:block!important;text-align:center!important;padding:16px 20px!important;font-size:16px!important}.h1{font-size:24px!important}.h2{font-size:20px!important}.body{padding:12px!important}.details{padding:12px 16px!important}}</style>
// </head>
// <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:12px" class="body">
// <tr><td align="center">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:540px">
// <tr><td style="background:linear-gradient(135deg,#b50064,#7a0045);padding:40px 32px;text-align:center" class="header">
// <h1 class="h1" style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px">Ravenship</h1>
// <p style="margin:8px 0 0;color:#ffd9e3;font-size:15px">Mentorship Platform</p>
// </td></tr>
// <tr><td style="padding:36px 32px" class="inner">
// <h2 class="h2" style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700">Welcome aboard, {{user_name}}! 🎉</h2>
// <p style="margin:0 0 20px;color:#594048;font-size:15px;line-height:1.6">Thanks for creating your Ravenship account. You're now registered as <strong style="color:#b50064">{{user_role}}</strong>.</p>
// <p style="margin:0 0 20px;color:#594048;font-size:15px;line-height:1.6">Your account is currently <strong style="color:#f57f17">pending verification</strong> by an administrator. You'll receive another email once your account has been approved.</p>
// <table role="presentation" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%" class="details">
// <tr><td style="font-size:14px;color:#594048;padding-bottom:6px;font-weight:600">Account Details</td></tr>
// <tr><td style="font-size:14px;color:#1a1a1a"><strong>Email:</strong> {{to_email}}</td></tr>
// <tr><td style="font-size:14px;color:#1a1a1a;padding-top:4px"><strong>Role:</strong> {{user_role}}</td></tr>
// </table>
// <p style="margin:0;color:#999;font-size:13px;line-height:1.5">If you didn't create this account, you can safely ignore this email.</p>
// </td></tr>
// <tr><td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee" class="footer">
// <p style="margin:0;color:#999;font-size:12px">&copy; 2026 Ravenship. All rights reserved.</p>
// </td></tr></table></td></tr></table></body></html>
//
// ── TEMPLATE B: Admin Notification (HTML to paste in EmailJS) ──
// <!DOCTYPE html>
// <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
// <style>@media(max-width:480px){.inner{padding:24px 20px!important}.header{padding:32px 20px!important}.footer{padding:16px 20px!important}.btn{display:block!important;text-align:center!important;padding:16px 20px!important;font-size:16px!important}.h1{font-size:24px!important}.h2{font-size:20px!important}.body{padding:12px!important}.details{padding:12px 16px!important}}</style>
// </head>
// <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:12px" class="body">
// <tr><td align="center">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:540px">
// <tr><td style="background:linear-gradient(135deg,#b50064,#7a0045);padding:40px 32px;text-align:center" class="header">
// <h1 class="h1" style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px">Ravenship</h1>
// <p style="margin:8px 0 0;color:#ffd9e3;font-size:15px">Admin Notification</p>
// </td></tr>
// <tr><td style="padding:36px 32px" class="inner">
// <h2 class="h2" style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700">New User Registration 👤</h2>
// <p style="margin:0 0 20px;color:#594048;font-size:15px;line-height:1.6">Hi {{admin_name}}, a new user has just signed up and needs your approval.</p>
// <table role="presentation" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%" class="details">
// <tr><td style="font-size:14px;color:#594048;padding-bottom:8px;font-weight:600">New User Details</td></tr>
// <tr><td style="font-size:14px;color:#1a1a1a;padding-bottom:4px"><strong>Name:</strong> {{user_name}}</td></tr>
// <tr><td style="font-size:14px;color:#1a1a1a;padding-bottom:4px"><strong>Email:</strong> {{user_email}}</td></tr>
// <tr><td style="font-size:14px;color:#1a1a1a"><strong>Role:</strong> {{user_role}}</td></tr>
// </table>
// <a href="https://ravenship.vercel.app/dashboard/admin" class="btn" style="display:inline-block;background:#b50064;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px">Review in Dashboard →</a>
// </td></tr>
// <tr><td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee" class="footer">
// <p style="margin:0;color:#999;font-size:12px">&copy; 2026 Ravenship. All rights reserved.</p>
// </td></tr></table></td></tr></table></body></html>
//
// ── TEMPLATE C: Approval Email (HTML to paste in EmailJS) ──
// <!DOCTYPE html>
// <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
// <style>@media(max-width:480px){.inner{padding:24px 20px!important}.header{padding:32px 20px!important}.footer{padding:16px 20px!important}.btn{display:block!important;text-align:center!important;padding:16px 20px!important;font-size:16px!important}.h1{font-size:24px!important}.h2{font-size:20px!important}.body{padding:12px!important}}</style>
// </head>
// <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:12px" class="body">
// <tr><td align="center">
// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:540px">
// <tr><td style="background:linear-gradient(135deg,#b50064,#7a0045);padding:40px 32px;text-align:center" class="header">
// <h1 class="h1" style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px">Ravenship</h1>
// <p style="margin:8px 0 0;color:#ffd9e3;font-size:15px">Account Approved</p>
// </td></tr>
// <tr><td style="padding:36px 32px" class="inner">
// <h2 class="h2" style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700">You're approved, {{user_name}}! ✅</h2>
// <p style="margin:0 0 20px;color:#594048;font-size:15px;line-height:1.6">Your account has been verified by the administrator. You can now log in and start using Ravenship as a <strong style="color:#b50064">{{user_role}}</strong>.</p>
// <a href="https://ravenship.vercel.app" class="btn" style="display:inline-block;background:#b50064;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px">Log In Now →</a>
// <p style="margin:24px 0 0;color:#999;font-size:13px;line-height:1.5">If you have any questions, reach out to your administrator.</p>
// </td></tr>
// <tr><td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee" class="footer">
// <p style="margin:0;color:#999;font-size:12px">&copy; 2026 Ravenship. All rights reserved.</p>
// </td></tr></table></td></tr></table></body></html>

const EMAILJS_CONFIG = {
  publicKey: "F851oYn80X-lP3EH0",
  serviceId: "ArsZpiX1uGqPQknvrNlII",
  welcomeTemplateId: "YOUR_WELCOME_TEMPLATE_ID",
  adminNotifyTemplateId: "template_unr4g9i",
  approvedTemplateId: "template_1eunsv2",
};

const ADMIN_EMAIL = "tripelkay@gmail.com";
const ADMIN_NAME = "Admin";

let initialized = false;

function ensureInit() {
  if (!initialized && EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    initialized = true;
  }
}

export async function sendWelcomeEmail({ name, email, role }) {
  if (EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY") return;
  ensureInit();
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.welcomeTemplateId, {
      to_name: name,
      to_email: email,
      user_name: name,
      user_role: role,
    });
  } catch (e) { console.error("sendWelcomeEmail error:", e); }
}

export async function sendAdminNotifyEmail({ name, email, role }) {
  if (EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY") return;
  ensureInit();
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminNotifyTemplateId, {
      admin_name: ADMIN_NAME,
      admin_email: ADMIN_EMAIL,
      user_name: name,
      user_email: email,
      user_role: role,
    });
  } catch (e) { console.error("sendAdminNotifyEmail error:", e); }
}

export async function sendApprovedEmail({ name, email, role }) {
  if (EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY") return;
  ensureInit();
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.approvedTemplateId, {
      to_name: name,
      to_email: email,
      user_name: name,
      user_role: role,
    });
  } catch (e) { console.error("sendApprovedEmail error:", e); }
}
