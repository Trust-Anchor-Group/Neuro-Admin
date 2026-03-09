export const MEDIA_RULES = {
  imageMaxBytes: 5 * 1024 * 1024,
  resourceMaxBytes: 20 * 1024 * 1024,
  logoMinWidth: 300,
  logoMinHeight: 300,
  mediaMinWidth: 1024,
  mediaMinHeight: 768,
};

export function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export async function validateImageFile(file, options = {}) {
  const {
    label = "Image",
    maxBytes = MEDIA_RULES.imageMaxBytes,
  } = options;

  if (!file) {
    return { error: "", warning: "" };
  }

  if (!String(file.type || "").startsWith("image/")) {
    return { error: `${label} must be an image file.`, warning: "" };
  }

  if (Number(file.size || 0) > maxBytes) {
    return {
      error: `${label} is too large (${formatFileSize(file.size)}). Please compress it below ${formatFileSize(maxBytes)} and upload again.`,
      warning: "",
    };
  }

  return { error: "", warning: "" };
}

export function validateFileSize(file, options = {}) {
  const {
    label = "File",
    maxBytes = MEDIA_RULES.resourceMaxBytes,
  } = options;

  if (!file) {
    return { error: "", warning: "" };
  }

  if (Number(file.size || 0) > maxBytes) {
    return {
      error: `${label} is too large (${formatFileSize(file.size)}). Please compress it below ${formatFileSize(maxBytes)} and upload again.`,
      warning: "",
    };
  }

  return { error: "", warning: "" };
}
