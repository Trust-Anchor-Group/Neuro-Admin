export async function runNotifications() {
  const startedAt = new Date().toISOString();

  // next steps will:
  // - load Preferences XML & State XML via AgentAPI
  // - per admin: check work hours + cadence, compute window
  // - list pending apps from Neuron in the window
  // - send email(s)
  // - update State XML for only those admins and save

  return {
    startedAt,
    adminsChecked: 0,
    emailsSent: 0,
    mode: "stub",
  };
}
