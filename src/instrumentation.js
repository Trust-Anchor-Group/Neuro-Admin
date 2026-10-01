import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    if (process.env.ID_ALERT_RECEIVER_ENABLED === 'true') {
      const { startReceiver } = await import('./lib/idAlerts/receiver.mjs');
      void startReceiver().catch((error) => console.error('[id-alerts] receiver startup failed', { name: error.name }));
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
