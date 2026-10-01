// Run only after checking provider activity for this alert/attempt. Uses the
// existing Azure Table connection in the process environment; prints no secrets.
import { retryNotification } from '../src/lib/idAlerts/store.mjs';
import { validAlertId } from '../src/lib/idAlerts/webhooks.mjs';

const [id, channel, operatorId, confirmation] = process.argv.slice(2);
if (!validAlertId(id) || !['email', 'whatsapp'].includes(channel) || !operatorId || confirmation !== '--confirmed-not-delivered') {
  console.error('Usage: node scripts/retry-id-alert-notification.mjs <alert-id> <email|whatsapp> <operator-id> --confirmed-not-delivered');
  process.exitCode = 1;
} else {
  try {
    const alert = await retryNotification(id, channel, operatorId);
    if (!alert) throw new Error('Alert not found');
    console.info(JSON.stringify({ id: alert.id, channel, state: alert.notifications[channel].state }));
  } catch (error) {
    console.error('Notification was not queued', { name: error.name, statusCode: error.statusCode });
    process.exitCode = 1;
  }
}
