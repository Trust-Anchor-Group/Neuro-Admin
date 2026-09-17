export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

    if (connectionString && !globalThis.__azureMonitorInitialized) {
      try {
        const { useAzureMonitor } = await import("@azure/monitor-opentelemetry");

        useAzureMonitor({
          azureMonitorExporterOptions: { connectionString },
          // This initial dev rollout exports server console logs only.
          enableLiveMetrics: false,
          enablePerformanceCounters: false,
          enableStandardMetrics: false,
          instrumentationOptions: {
            azureSdk: { enabled: false },
            console: { enabled: true },
            http: { enabled: false },
            mongoDb: { enabled: false },
            mySql: { enabled: false },
            postgreSql: { enabled: false },
            redis: { enabled: false },
            redis4: { enabled: false },
          },
        });

        globalThis.__azureMonitorInitialized = true;
      } catch {
        // Telemetry must never prevent the application from starting.
      }
    }

    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(...args) {
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
