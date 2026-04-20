"use client";

export default function TriggerErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error("Sentry client test error from /sentry-example-page");
      }}
      className="rounded-md bg-red-600 text-white px-5 py-2.5 font-medium hover:bg-red-700 transition"
    >
      Trigger Test Error
    </button>
  );
}
