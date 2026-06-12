const DEV_NEURON_HOST = 'dev.athletesandyou.tagroot.io';
const DEV_LOGIN_URL = 'https://brave-rock-04a1ad803-dev.westeurope.4.azurestaticapps.net/';

export const VALID_IDENTITY_ACTIONS = new Set([
  'Approved',
  'Rejected',
  'Obsoleted',
  'Compromised',
]);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readPath(source, path) {
  return path.reduce((current, key) => current && current[key], source);
}

function hasValue(value) {
  return normalizeString(value).length > 0;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripRichText(value) {
  const input = normalizeString(value);
  if (!input) return '';

  return decodeHtmlEntities(
    input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeHost(value) {
  const input = normalizeString(value).toLowerCase();
  if (!input) return '';

  try {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return new URL(input).host.toLowerCase();
    }
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  return input.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

function maskEmail(value) {
  const email = normalizeString(value);
  if (!email.includes('@')) return email || 'missing';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0] || '*'}*@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function buildParagraphs(message) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 18px 0;">${escapeHtml(paragraph).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
}

function buildDynamicLink(action, neuronHost) {
  const normalizedHost = normalizeHost(neuronHost);

  if (action === 'Approved' && normalizedHost === DEV_NEURON_HOST) {
    return {
      label: 'Log in to your account',
      url: DEV_LOGIN_URL,
    };
  }

  return null;
}

function buildActionContent(action, reason, neuronHost) {
  const cta = buildDynamicLink(action, neuronHost);

  switch (action) {
    case 'Approved':
      return {
        subject: 'Your ID Application Has Been Approved',
        message: 'Congratulations! Your ID application has been approved.',
        cta,
      };
    case 'Rejected':
      return {
        subject: 'Your ID Application Has Been Rejected',
        message: [
          'We regret to inform you that your ID application has been rejected.',
          hasValue(reason) ? `Reason:\n${reason}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        cta: null,
      };
    case 'Obsoleted':
      return {
        subject: 'Your ID Has Been Marked Obsolete',
        message: 'Your ID has been marked as obsolete. Please contact support if you have questions.',
        cta: null,
      };
    case 'Compromised':
      return {
        subject: 'Important: Your ID May Be Compromised',
        message: 'Your ID has been marked as potentially compromised. Please contact support immediately.',
        cta: null,
      };
    default:
      return {
        subject: 'Notification from Neuro Admin',
        message: 'You have a new notification.',
        cta: null,
      };
  }
}

export function hasSessionCookie(cookieHeader = '') {
  return /(?:^|;\s*)HttpSessionID=/.test(cookieHeader);
}

export function resolveNotificationRecipientEmail(user) {
  const candidates = [
    ['properties', 'EMAIL'],
    ['other', 'EMAIL'],
    ['email'],
    ['EMAIL'],
    ['data', 'eMail'],
    ['data', 'EMAIL'],
  ];

  for (const path of candidates) {
    const value = normalizeString(readPath(user, path));
    if (value) return value;
  }

  return '';
}

export function hasNotificationRecipient(user) {
  return hasValue(resolveNotificationRecipientEmail(user));
}

export function generateIdentityEmailTemplate({ action, user, reason, neuronHost }) {
  const firstName = normalizeString(user?.properties?.FIRST);
  const organizationName = normalizeString(user?.properties?.ORGNAME);
  const email = resolveNotificationRecipientEmail(user);
  const displayName = firstName || organizationName;
  const safeReason = stripRichText(reason);
  const { subject, message, cta } = buildActionContent(action, safeReason, neuronHost);
  const greeting = `Hi${displayName ? ` ${displayName}` : ''},`;
  const text = `Neuro Identity Notification\n\n${greeting}\n\n${message}${cta ? `\n\n${cta.label}: ${cta.url}` : ''}\n\nBest regards,\nNeuro KYC Digital Identity Team`;
  const html = `
    <div style="font-family:sans-serif; background:#f6f6fa; padding:0; margin:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px #0001;overflow:hidden;">
        <tr>
          <td style="background:#8F40D4;padding:24px 0;text-align:center;">
            <img src="https://neuro.services/neuroAdminLogo.svg" alt="Neuro KYC Logo" style="height:48px;margin-bottom:8px;"/>
            <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:1px;">KYC Digital Identity Notification</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <p style="font-size:17px;color:#222;margin:0 0 18px 0;">${escapeHtml(greeting)}</p>
            ${buildParagraphs(message)}
            ${cta ? `<p style="font-size:16px;margin:0 0 18px 0;"><a href="${escapeHtml(cta.url)}" style="color:#8F40D4;text-decoration:none;font-weight:600;">${escapeHtml(cta.label)}</a></p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <p style="font-size:15px;color:#888;margin:32px 0 0 0;">Best regards,<br/><b>Neuro KYC Digital Identity Team</b></p>
          </td>
        </tr>
      </table>
    </div>
  `;

  return { to: email, subject, text, html };
}

export async function sendIdentityNotificationEmail({ action, user, reason, neuronHost }) {
  if (!VALID_IDENTITY_ACTIONS.has(action)) {
    return { success: false, status: 400, error: 'Invalid notification action' };
  }

  const email = resolveNotificationRecipientEmail(user);
  if (!email) {
    return { success: false, status: 400, error: 'Missing recipient email' };
  }

  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!sendGridApiKey || !fromEmail) {
    return { success: false, status: 500, error: 'SendGrid not configured' };
  }

  const { to, subject, text, html } = generateIdentityEmailTemplate({ action, user, reason, neuronHost });
  console.info('[identity-notification] sending email', {
    action,
    host: normalizeHost(neuronHost) || 'default',
    recipient: maskEmail(to),
  });

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('[identity-notification] sendgrid rejected email', {
        action,
        host: normalizeHost(neuronHost) || 'default',
        recipient: maskEmail(to),
        status: response.status,
        details,
      });
      return {
        success: false,
        status: response.status,
        error: 'SendGrid error',
        details,
      };
    }

    console.info('[identity-notification] sendgrid accepted email', {
      action,
      host: normalizeHost(neuronHost) || 'default',
      recipient: maskEmail(to),
      status: response.status || 202,
    });
    return { success: true, status: response.status || 202 };
  } catch (error) {
    console.error('[identity-notification] email send failed', {
      action,
      host: normalizeHost(neuronHost) || 'default',
      recipient: maskEmail(to),
      error: error.message || 'Unknown error',
    });
    return {
      success: false,
      status: 500,
      error: error.message || 'Failed to send notification email',
    };
  }
}
