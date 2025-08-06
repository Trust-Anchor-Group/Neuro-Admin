// src/utils/getClientId.js

export function getClientId() {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname
  const envHost = process.env.NEXT_PUBLIC_AGENT_HOST || ''

  const domainMap = {
    'kikkin.tagroot.io': 'kikkin',
    'mateo.lab.tagroot.io': 'Mateo',
  }

  // 1. Försök hitta client från actual domän
  for (const domain in domainMap) {
    if (host.includes(domain)) return domainMap[domain]
  }

  for (const domain in domainMap) {
    if (envHost.includes(domain)) return domainMap[domain]
  }

  return 'Mateo'
}
