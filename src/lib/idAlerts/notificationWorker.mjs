import { notificationChannel, notificationDue, notificationFailure } from './notifications.mjs';
import { notificationConfigError, sendNotification } from './notifier.mjs';

// Called by the existing receiver leader's retry timer, never from ingestion.
export async function deliverPendingNotifications(store, config, ownsLease = () => true, send = sendNotification) {
  for (const candidate of await store.listPendingNotifications()) {
    if (!ownsLease()) return;
    const alert = await store.prepareNotifications(candidate.id, config);
    if (!alert) continue;
    for (const key of Object.keys(alert.notifications)) {
      if (!ownsLease()) return;
      const channel = notificationChannel(key);
      const job = alert.notifications[key];
      if (!notificationDue(job)) continue;
      if (job.state === 'sending') { await store.expireNotification(alert.id, key); continue; }
      const recipient = channel === 'whatsapp' && !job.recipientSelectionPending
        ? (job.recipient ?? config.legacyWhatsappRecipient ?? process.env.TWILIO_WHATSAPP_TO) : undefined;
      const configError = notificationConfigError(channel, config, process.env, recipient);
      if (configError) { await store.blockNotification(alert.id, key, configError); continue; }
      const claimed = await store.claimNotification(alert.id, key, config);
      if (!claimed) continue;
      const attempt = claimed.notifications[key];
      if (!ownsLease()) {
        await store.finishNotification(alert.id, key, attempt.attemptId, { state: 'retry', lastError: 'lease_changed_before_send', nextAttemptAt: '' });
        return;
      }
      let result;
      try { result = await send(channel, claimed, config, { ...attempt, jobKey: key }); }
      catch { result = { state: 'unknown', error: 'unexpected_provider_outcome' }; }
      const update = result.state === 'accepted'
        ? { state: 'accepted', providerId: result.providerId, acceptedAt: new Date().toISOString(), lastError: '', nextAttemptAt: '' }
        : notificationFailure(result, attempt.attempts);
      try { await store.finishNotification(alert.id, key, attempt.attemptId, update); }
      catch { console.error('[id-alerts] notification checkpoint unavailable', { alertId: alert.id, channel }); }
    }
  }
}
