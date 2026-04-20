export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  throw new Error("Sentry server test error from /api/sentry-example-api");
}
