'use client';

import { useEffect, useState } from 'react';
import {
  ACTIVE_ADMIN_HOST_STORAGE_KEY,
  getStoredActiveAdminHost,
  normalizeActiveAdminHost,
  setStoredActiveAdminHost,
} from './activeAdminHostState.mjs';

export const ACTIVE_ADMIN_HOST_CHANGED_EVENT = 'active-admin-host-changed';
export { ACTIVE_ADMIN_HOST_STORAGE_KEY, normalizeActiveAdminHost };

export function getActiveAdminHost() {
  if (typeof window === 'undefined') return '';
  return getStoredActiveAdminHost(sessionStorage);
}

// Only call this with a host returned by an authoritative Neuro Admin endpoint.
export function syncActiveAdminHost(host) {
  if (typeof window === 'undefined') return '';

  const normalizedHost = normalizeActiveAdminHost(host);
  setStoredActiveAdminHost(sessionStorage, normalizedHost);

  window.dispatchEvent(new CustomEvent(ACTIVE_ADMIN_HOST_CHANGED_EVENT, {
    detail: normalizedHost,
  }));
  return normalizedHost;
}

export function clearActiveAdminHost() {
  return syncActiveAdminHost('');
}

export async function refreshActiveAdminHost() {
  const response = await fetch('/api/neuron-switch/current', {
    cache: 'no-store',
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load the active admin Neuron.');
  }

  return syncActiveAdminHost(payload?.activeHost);
}

export function useActiveAdminHost() {
  const [activeAdminHost, setActiveAdminHost] = useState(getActiveAdminHost);

  useEffect(() => {
    let mounted = true;
    const handleHostChange = (event) => {
      if (!mounted) return;
      setActiveAdminHost(normalizeActiveAdminHost(event?.detail));
    };

    window.addEventListener(ACTIVE_ADMIN_HOST_CHANGED_EVENT, handleHostChange);
    refreshActiveAdminHost()
      .then((host) => {
        if (mounted) setActiveAdminHost(host);
      })
      .catch(() => {
        // The existing mirror remains a rendering cache while the server is unavailable.
      });

    return () => {
      mounted = false;
      window.removeEventListener(ACTIVE_ADMIN_HOST_CHANGED_EVENT, handleHostChange);
    };
  }, []);

  return activeAdminHost;
}
