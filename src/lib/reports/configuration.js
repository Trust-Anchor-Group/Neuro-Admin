export function normalizeReportsHost(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

function parseMap(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return Object.fromEntries(raw.split(',').map((entry) => entry.split('=').map((part) => part.trim()))
      .filter(([host, jid]) => host && jid));
  }
}

const KNOWN_REPORTS_JID_MAP = {
  'lab.tagroot.io': 'lab.tagroot.io@tagroot.io',
  'athletesandyou.tagroot.io': 'athletesandyou.eu.id.tagroot.io@eu.id.tagroot.io',
};

export function getReportsJidMap(rawValue = process.env.NEXT_PUBLIC_REPORTS_JID_MAP) {
  return Object.fromEntries(Object.entries({ ...KNOWN_REPORTS_JID_MAP, ...parseMap(rawValue) })
    .map(([host, jid]) => [normalizeReportsHost(host), String(jid || '').trim()])
    .filter(([host, jid]) => host && jid));
}

export function resolveReportsJid(activeAdminHost, rawValue) {
  const host = normalizeReportsHost(activeAdminHost);
  if (!host) return '';
  const configured = getReportsJidMap(rawValue)[host];
  if (configured) return configured;

  // Tagroot Neurons conventionally expose their Reports concentrator using
  // the Neuron host as the local part and tagroot.io as the XMPP domain.
  // Keep other domains explicit so an arbitrary active host is never turned
  // into an unverified Reports target by accident.
  if (host.endsWith('.tagroot.io')) return `${host}@tagroot.io`;

  return '';
}

export function validateReportsJid(jid) {
  const value = String(jid || '').trim();
  if (!value) return 'Reports are not configured for this Neuron.';
  if (!/^[^@\s/]+@[^@\s/]+(?:\/[^\s]+)?$/.test(value)) {
    return 'The configured Reports JID is invalid.';
  }
  return '';
}
