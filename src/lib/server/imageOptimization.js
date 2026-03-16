import sharp from "sharp";

const DEFAULTS = {
  maxInputBytes: 12 * 1024 * 1024,
  maxInputPixels: 40_000_000,
  maxWidth: 2048,
  maxHeight: 2048,
  webpQuality: 82,
  webpEffort: 4,
};

export const IMAGE_PROFILES = {
  projectMedia: {
    ...DEFAULTS,
    maxWidth: 2560,
    maxHeight: 2560,
    webpQuality: 82,
  },
  issuerLogo: {
    ...DEFAULTS,
    maxWidth: 1024,
    maxHeight: 1024,
    webpQuality: 86,
  },
};

class ImageOptimizationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ImageOptimizationError";
    this.statusCode = statusCode;
  }
}

function isImageFile(value) {
  return value instanceof File && String(value.type || "").toLowerCase().startsWith("image/");
}

function toWebpFilename(fileName) {
  const raw = String(fileName || "upload").trim();
  const withoutExt = raw.replace(/\.[^/.]+$/, "");
  return `${withoutExt || "upload"}.webp`;
}

async function optimizeImageFile(file, profile) {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  if (inputBuffer.length > profile.maxInputBytes) {
    throw new ImageOptimizationError(
      `Image ${file.name} is too large before optimization. Max upload size is ${Math.round(profile.maxInputBytes / (1024 * 1024))}MB.`,
      413,
    );
  }

  const transformer = sharp(inputBuffer, {
    failOnError: false,
    limitInputPixels: profile.maxInputPixels,
    animated: false,
  }).rotate();

  const metadata = await transformer.metadata();
  if (!metadata?.width || !metadata?.height) {
    throw new ImageOptimizationError(`Image ${file.name} is invalid or unsupported.`);
  }

  const webpBuffer = await transformer
    .resize({
      width: profile.maxWidth,
      height: profile.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: profile.webpQuality,
      effort: profile.webpEffort,
    })
    .toBuffer();

  const keepOriginal = webpBuffer.length >= Math.floor(inputBuffer.length * 0.98);
  if (keepOriginal) {
    return {
      file,
      filename: file.name,
      wasConverted: false,
    };
  }

  const fileName = toWebpFilename(file.name);
  const optimizedFile = new File([webpBuffer], fileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  return {
    file: optimizedFile,
    filename: fileName,
    wasConverted: true,
  };
}

export async function optimizeImageFormData(incomingFormData, profile = IMAGE_PROFILES.projectMedia) {
  const nextFormData = new FormData();
  let outputFileName = "";

  for (const [key, value] of incomingFormData.entries()) {
    if (!isImageFile(value)) {
      nextFormData.append(key, value);
      continue;
    }

    const optimized = await optimizeImageFile(value, profile);
    nextFormData.append(key, optimized.file);

    if (!outputFileName && (key === "upload_image" || key === "file")) {
      outputFileName = optimized.filename;
    }
  }

  if (outputFileName) {
    if (nextFormData.has("image_name")) {
      nextFormData.set("image_name", outputFileName);
    }
    if (nextFormData.has("name")) {
      nextFormData.set("name", outputFileName);
    }
  }

  return nextFormData;
}

export function mapOptimizationError(error) {
  if (error instanceof ImageOptimizationError) {
    return {
      statusCode: error.statusCode || 400,
      message: error.message,
    };
  }

  return {
    statusCode: 400,
    message: "Failed to optimize image before upload.",
  };
}
