function tryExtractJsonMessage(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  const braceIndex = raw.indexOf("{");
  if (braceIndex >= 0) {
    const jsonCandidate = raw.slice(braceIndex);
    try {
      const parsed = JSON.parse(jsonCandidate);
      if (parsed?.message) return String(parsed.message);
    } catch {
    }
  }

  return raw;
}

export function mapBackendValidationError(error) {
  const message = tryExtractJsonMessage(error?.message || error);

  const fieldErrors = {};

  if (/project_country(_code)?\s+have to be between\s+3\s+and\s+3\s+characters/i.test(message)) {
    fieldErrors.projectCountry = "Country code must be exactly 3 characters.";
  }

  if (/issuer_name\s+have to be between\s+5\s+and\s+40\s+characters/i.test(message) || /issuer\.en-US\.name\s+must be between\s+5\s+and\s+40\s+characters/i.test(message)) {
    fieldErrors.issuerName = "Issuer name must be between 5 and 40 characters.";
  }

  const formError = Object.keys(fieldErrors).length > 0
    ? "Please correct the highlighted fields."
    : (message || "Request failed.");

  return {
    formError,
    fieldErrors,
    backendMessage: message,
  };
}
