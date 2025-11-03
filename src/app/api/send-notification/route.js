import { NextResponse } from 'next/server';

// Helper to generate email content based on action, user, and reason
function generateEmailTemplate({ action, user, reason }) {
  // Fallbacks
  const firstName = user?.properties?.FIRST || '';
  const email = user?.properties?.EMAIL || '';
  let subject = 'Notification from Neuro Admin';
  let message = '';
  let dynamicLink = 'https://kikkin.neuro-kyc.com/';

  switch (action) {
    case 'Approved':
      subject = 'Your ID Application Has Been Approved';
      message = 'Congratulations! Your ID application has been approved.';
      dynamicLink = 'https://kikkin.neuro-kyc.com/login';
      break;
    case 'Rejected':
      subject = 'Your ID Application Has Been Rejected';
      message = 'We regret to inform you that your ID application has been rejected.';
      if (reason && reason.trim()) {
        message += `\n\nReason:\n${reason}`;
      }
      break;
    case 'Obsoleted':
      subject = 'Your ID Has Been Marked Obsolete';
      message = 'Your ID has been marked as obsolete. Please contact support if you have questions.';
      break;
    case 'Compromised':
      subject = 'Important: Your ID May Be Compromised';
      message = 'Your ID has been marked as potentially compromised. Please contact support immediately.';
      break;
    default:
      subject = 'Notification from Neuro Admin';
      message = 'You have a new notification.';
      break;
  }

  const text = `Neuro Identity Notification\n\nHi${firstName ? ' ' + firstName : ''},\n\n${message}$ : ''}\n\nBest regards,\nNeuro KYC Digital Identity Team\nhttps://kikkin.neuro-kyc.com/`;

  const html = `
    <div style="font-family:sans-serif; background:#f6f6fa; padding:0; margin:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px #0001;overflow:hidden;">
        <tr>
          <td style="background:#8F40D4;padding:24px 0;text-align:center;">
            <img src='https://neuro.services/neuroAdminLogo.svg' alt='Neuro KYC Logo' style='height:48px;margin-bottom:8px;'/>
            <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:1px;">KYC Digital Identity Notification</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <p style="font-size:17px;color:#222;margin:0 0 18px 0;">Hi${firstName ? ' ' + firstName : ''},</p>
            <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 18px 0;">${message.replace(/\n/g, '<br/>')}</p>
           
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <p style="font-size:15px;color:#888;margin:32px 0 0 0;">Best regards,<br/><b>Neuro KYC Digital Identity Team</b><br/><a href="https://kikkin.neuro-kyc.com/" style="color:#8F40D4;text-decoration:none;">https://kikkin.neuro-kyc.com/</a></p>
          </td>
        </tr>
      </table>
    </div>
  `;
  return { to: email, subject, text, html };
}

export async function POST(req) {
  try {
    const { action, user, reason } = await req.json();
    if (!action || !user || !user.properties?.EMAIL) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    if (!SENDGRID_API_KEY || !FROM_EMAIL) {
      return NextResponse.json({ error: 'SendGrid not configured' }, { status: 500 });
    }

    const { to, subject, text, html } = generateEmailTemplate({ action, user, reason });

    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html }
        ]
      })
    });

    if (!sgRes.ok) {
      const errText = await sgRes.text();
      return NextResponse.json({ error: 'SendGrid error', details: errText }, { status: sgRes.status });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
