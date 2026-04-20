import { notFound } from "next/navigation";
import TriggerErrorButton from "./TriggerErrorButton";

export const metadata = {
  title: "Sentry Example Page",
};

export default function SentryExamplePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-semibold mb-3">Sentry Example Page</h1>
      <p className="max-w-xl text-center text-gray-600 mb-8">
        Click the button below to trigger a client-side test error and verify Sentry event ingestion.
      </p>
      <TriggerErrorButton />
    </main>
  );
}
