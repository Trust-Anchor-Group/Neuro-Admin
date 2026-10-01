import { createHash } from 'node:crypto';

export const CHANNELS = ['email', 'whatsapp'];
export const SEND_LEASE_MS = 120000;
export const MAX_ATTEMPTS = 12;
export const recipientHash = (value) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

export function initialNotifications(config = {}) {
  return Object.fromEntries(CHANNELS.map((channel) => [channel, {
    state: (channel === 'email' ? config.emailEnabled !== false : config.whatsappEnabled === true) ? 'pending' : 'disabled',
    attempts: 0, lastError: '', nextAttemptAt: '',
  }]));
}

// Old 'sent' means provider acceptance, not delivery. Never replay historical sends.
export function legacyNotifications(alert) {
  const jobs = initialNotifications();
  if (alert.notificationState === 'sent') jobs.email.state = 'accepted';
  return jobs;
}

export function aggregateNotifications(jobs) {
  const states = Object.values(jobs).map((job) => job.state);
  if (states.some((state) => ['pending', 'retry', 'blocked', 'sending'].includes(state))) return 'pending';
  if (states.some((state) => ['unknown', 'failed', 'delivery_failed'].includes(state))) return 'attention';
  return 'complete';
}

export function notificationDue(job, now = Date.now()) {
  if (job.state === 'sending') return Date.parse(job.leaseUntil) <= now;
  return ['pending', 'retry', 'blocked'].includes(job.state) &&
    (!job.nextAttemptAt || Date.parse(job.nextAttemptAt) <= now);
}

export function notificationFailure(result, attempts, now = Date.now()) {
  if (result.state === 'unknown') return { state: 'unknown', lastError: result.error, nextAttemptAt: '' };
  return {
    state: attempts >= MAX_ATTEMPTS ? 'failed' : 'retry', lastError: result.error,
    nextAttemptAt: attempts >= MAX_ATTEMPTS ? '' : new Date(now + Math.min(3600000, 30000 * 2 ** (attempts - 1))).toISOString(),
  };
}

export function publicAlert(alert) {
  const fields = ['id', 'sourceNeuronId', 'sourceNeuronName', 'sourceJid', 'customerId', 'eventId',
    'applicationRef', 'legalIdentityRef', 'eventTimestamp', 'receivedAt', 'firstSeenAt', 'status',
    'claimedBy', 'claimedAt', 'acknowledgedBy', 'acknowledgedAt', 'handledBy', 'handledAt', 'auditTrail'];
  const safe = Object.fromEntries(fields.filter((key) => alert[key] !== undefined).map((key) => [key, alert[key]]));
  safe.message = 'Legal Identity application registered.';
  safe.notifications = Object.fromEntries(Object.entries(alert.notifications || legacyNotifications(alert)).map(([channel, job]) => [channel, {
    state: job.state, attempts: job.attempts, lastError: job.lastError || '',
    nextAttemptAt: job.nextAttemptAt || '', acceptedAt: job.acceptedAt || '', deliveredAt: job.deliveredAt || '',
  }]));
  return safe;
}

export function applyDelivery(job, update, now = new Date().toISOString()) {
  if (job.attemptId !== update.attemptId || !['sending', 'unknown', 'accepted', 'delivered', 'delivery_failed'].includes(job.state)) return null;
  if (job.providerId && update.providerId && job.providerId !== update.providerId) return null;
  const next = { ...job, providerId: job.providerId || update.providerId || '', nextAttemptAt: '', leaseUntil: '' };
  if (update.recipient) {
    if (!job.recipientHashes?.includes(update.recipient)) return null;
    const deliveries = { ...job.deliveries };
    const previous = deliveries[update.recipient];
    if (previous !== 'delivered' && (previous !== 'delivery_failed' || update.state === 'delivered')) deliveries[update.recipient] = update.state;
    next.deliveries = deliveries;
    next.state = job.recipientHashes.every((key) => deliveries[key] === 'delivered') ? 'delivered'
      : Object.values(deliveries).includes('delivery_failed') ? 'delivery_failed' : 'accepted';
  } else {
    if (job.state === 'delivered' || (job.state === 'delivery_failed' && update.state !== 'delivered')) return null;
    next.state = update.state;
  }
  next.acceptedAt ||= now;
  if (next.state === 'delivered') { next.deliveredAt ||= now; next.lastError = ''; }
  else if (update.error) next.lastError = update.error;
  return next;
}
