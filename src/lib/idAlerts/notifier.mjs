export async function notifyNewApplication(alert, config, fetchImpl = fetch) {
  if (!config.operatorEmails.length) {
    if (process.env.NODE_ENV === 'production') throw new Error('ID_ALERT_OPERATOR_EMAILS is required in production');
    console.info('[id-alerts] development notification', { alertId: alert.id, neuronId: alert.sourceNeuronId });
    return;
  }
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!key || !from) throw new Error('SendGrid operator notification is not configured');
  const response = await fetchImpl('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: config.operatorEmails.map((email) => ({ email })) }],
      from: { email: from },
      subject: `New ID application on ${alert.sourceNeuronName}`,
      content: [{ type: 'text/plain', value: `A new ID application event arrived from ${alert.sourceNeuronName}. Open the central ID Applications inbox to claim it.\n\nAlert ID: ${alert.id}` }],
    }),
  });
  if (!response.ok) throw new Error(`SendGrid rejected operator notification (${response.status})`);
}
