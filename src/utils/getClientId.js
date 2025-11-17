// src/utils/getClientId.js

export function getClientId() {
  if (typeof window === 'undefined') return null;

  // Try to get host from <meta name="NEURON" content="..." />
  let host = null;
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="NEURON"]');
    if (meta && meta.content) {
      host = meta.content;
    }
  }
  if (!host) {
    host = window.location.hostname;
  }

  const domainMap = {
    'kikkin.tagroot.io': 'kikkin',
    'mateo.lab.tagroot.io': 'Mateo',
  };

  // 1. Try to find client from actual domain
  for (const domain in domainMap) {
    if (host.includes(domain)) return domainMap[domain];
  }

  return null;
}
