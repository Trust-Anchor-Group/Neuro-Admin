export const ACTIVE_ADMIN_HOST_STORAGE_KEY = 'neuro-admin.activeAdminHost';

export function normalizeActiveAdminHost(host) {
  return String(host || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function getStoredActiveAdminHost(storage) {
  return normalizeActiveAdminHost(storage?.getItem(ACTIVE_ADMIN_HOST_STORAGE_KEY));
}

export function setStoredActiveAdminHost(storage, host) {
  const normalizedHost = normalizeActiveAdminHost(host);
  if (normalizedHost) {
    storage.setItem(ACTIVE_ADMIN_HOST_STORAGE_KEY, normalizedHost);
  } else {
    storage.removeItem(ACTIVE_ADMIN_HOST_STORAGE_KEY);
  }
  return normalizedHost;
}
