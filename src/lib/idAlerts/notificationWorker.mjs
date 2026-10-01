import { CHANNELS, notificationDue, notificationFailure } from './notifications.mjs';
import { notificationConfigError, sendNotification } from './notifier.mjs';

// Called by the existing receiver leader's retry timer, never from ingestion.
export async function deliverPendingNotifications(store, config, ownsLease = () => true, send = sendNotification) {
  for (const candidate of await store.listPendingNotifications()) {
    if (!ownsLease()) return;
    const alert = await store.prepareNotifications(candidate.id);
    if (!alert) continue;
    for (const channel of CHANNELS) {
      if (!ownsLease()) return;
      const job = alert.notifications[channel];
      if (!notificationDue(job)) continue;
      if (job.state === 'sending') { await store.expireNotification(alert.id, channel); continue; }
      const configError = notificationConfigError(channel, config);
      if (configError) { await store.blockNotification(alert.id, channel, configError); continue; }
      const claimed = await store.claimNotification(alert.id, channel, config);
      if (!claimed) continue;
      const attempt = claimed.notifications[channel];
      if (!ownsLease()) {
        await store.finishNotification(alert.id, channel, attempt.attemptId, { state: 'retry', lastError: 'lease_changed_before_send', nextAttemptAt: '' });
        return;
      }
      let result;
      try { result = await send(channel, claimed, config, attempt); }
      catch { result = { state: 'unknown', error: 'unexpected_provider_outcome' }; }
      const update = result.state === 'accepted'
        ? { state: 'accepted', providerId: result.providerId, acceptedAt: new Date().toISOString(), lastError: '', nextAttemptAt: '' }
        : notificationFailure(result, attempt.attempts);
      try { await store.finishNotification(alert.id, channel, attempt.attemptId, update); }
      catch { console.error('[id-alerts] notification checkpoint unavailable', { alertId: alert.id, channel }); }
    }
  }
}
