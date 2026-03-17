/**
 * @typedef {"en-US" | "pt-PT"} LocalizationCode
 */

/**
 * @typedef {Object} LocalizedContent
 * @property {string} title
 * @property {string} asset_type
 * @property {string} short_description
 * @property {string} long_description
 * @property {string[]} tags
 */

/**
 * @typedef {Object} ProjectWizardState
 * @property {string} [existingIssuerId]
 * @property {File | null} [issuerLogo]
 * @property {{"en-US": {name: string, about: string, location: string, industry: string}, "pt-PT": {name: string, about: string, location: string, industry: string}}} issuer
 * @property {{
 *   token_price: number | "",
 *   token_premium: number | "",
 *   currency: string,
 *   min_investment: number | "",
 *   max_investment: number | "",
 *   token_quantity: number | "",
 *   token_friendly_name: string,
 *   token_description: string,
 *   project_label: string,
 *   project_type: string,
 *   project_country_code: string,
 *   public_investment_progress: boolean,
 *   start_date: string,
 *   end_date: string
 * }} projectFinancials
 * @property {string} [visibility]
 * @property {boolean} [public_investment_progress]
 * @property {{"en-US": LocalizedContent, "pt-PT": LocalizedContent}} projectContent
 * @property {{thumbnail: File | null, galleryImages: File[], resources: {file: File, title: string}[]}} media
 */

/**
 * @typedef {Object} UpdateProjectState
 * @property {string} projectId
 * @property {string} issuerId
 * @property {string} [visibility]
 * @property {boolean} [public_investment_progress]
 * @property {{"en-US": {name: string, about: string, location: string, industry: string}, "pt-PT": {name: string, about: string, location: string, industry: string}}} issuer
 * @property {{token_price: number, token_premium: number, min_investment: number, max_investment: number, project_country_code?: string, visibility?: string, public_investment_progress?: boolean, start_date?: string, end_date?: string}} projectFinancials
 * @property {{"en-US": LocalizedContent, "pt-PT": LocalizedContent}} projectContent
 * @property {{imageIds: string[], deleteThumbnail: boolean, resourceIds: string[]}} mediaToRemove
 * @property {{thumbnail: File | null, newGalleryImages: File[], newResources: {file: File, title: string}[]}} newMedia
 */

/** @type {LocalizationCode[]} */
const LOCALIZATIONS = ["en-US", "pt-PT"];

/** @returns {ProjectWizardState} */
export function createInitialProjectWizardState() {
  return {
    issuerLogo: null,
    issuer: {
      "en-US": {
        name: "",
        about: "",
        location: "",
        industry: "",
      },
      "pt-PT": {
        name: "",
        about: "",
        location: "",
        industry: "",
      },
    },
    projectFinancials: {
      token_price: "",
      token_premium: "",
      currency: "",
      min_investment: "",
      max_investment: "",
      token_quantity: "",
      token_friendly_name: "",
      token_description: "",
      project_label: "",
      project_type: "",
      project_country_code: "",
      visibility: "",
      public_investment_progress: true,
      start_date: "",
      end_date: "",
    },
    projectContent: {
      "en-US": {
        title: "",
        asset_type: "",
        short_description: "",
        long_description: "",
        tags: [],
      },
      "pt-PT": {
        title: "",
        asset_type: "",
        short_description: "",
        long_description: "",
        tags: [],
      },
    },
    media: {
      thumbnail: null,
      galleryImages: [],
      resources: [],
    },
  };
}

async function parseResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string"
      ? payload
      : payload?.message || fallbackMessage || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function toTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function extractData(payload) {
  return payload?.data?.data || payload?.data || payload;
}

function resolveIssuerPayload(issuerState, localization) {
  const en = issuerState?.["en-US"] || {};
  const localized = issuerState?.[localization] || {};

  const pick = (key) => {
    const localizedValue = String(localized?.[key] || "").trim();
    const enValue = String(en?.[key] || "").trim();
    return localizedValue || enValue;
  };

  return {
    name: pick("name"),
    about: pick("about"),
    location: pick("location"),
    industry: pick("industry"),
  };
}

async function upsertIssuerLocalization(issuerId, body) {
  const existingLocalizations = await fetchIssuerLocalizations(issuerId);
  const exists = hasLocalization(existingLocalizations, body?.localization);
  const method = exists ? "PATCH" : "POST";

  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  await parseResponse(response, `Failed to ${exists ? "update" : "create"} issuer localization`);
}

async function fetchIssuerLocalizations(issuerId) {
  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (response.status === 404) {
    return [];
  }

  const payload = await parseResponse(response, "Failed to list issuer localizations");
  const data = extractData(payload);
  return Array.isArray(data) ? data : [];
}

function hasLocalization(list, localization) {
  const key = String(localization || "").trim();
  if (!key) return false;
  return (Array.isArray(list) ? list : []).some((item) => item?.localization === key);
}

async function uploadIssuerLogo(issuerId, logoFile) {
  if (!logoFile) return;

  await Promise.all(
    LOCALIZATIONS.map(async (localization) => {
      const formData = new FormData();
      formData.append("upload_image", logoFile);
      formData.append("localization", localization);
      formData.append("image_description", "Issuer profile photo");
      formData.append("image_name", String(logoFile?.name || "issuer-logo"));
      formData.append("name", String(logoFile?.name || "issuer-logo"));

      const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization/profilePhoto`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      await parseResponse(response, `Failed to upload issuer profile photo (${localization})`);
    }),
  );
}

function assertRequired(state) {
  const issuerEn = state?.issuer?.["en-US"] || {};
  const financials = state.projectFinancials;

  if (!String(issuerEn.name || "").trim()) throw new Error("EN issuer name is required.");
  if (String(issuerEn.name || "").trim().length < 5 || String(issuerEn.name || "").trim().length > 40) {
    throw new Error("EN issuer name must be between 5 and 40 characters.");
  }
  if (!String(issuerEn.about || "").trim()) throw new Error("EN issuer about is required.");
  if (!String(issuerEn.location || "").trim()) throw new Error("EN issuer location is required.");
  if (!String(issuerEn.industry || "").trim()) throw new Error("EN issuer industry is required.");

  const requiredFinancials = [
    "token_price",
    "token_premium",
    "currency",
    "token_quantity",
    "token_friendly_name",
    "token_description",
    "project_label",
    "project_type",
    "project_country_code",
  ];

  for (const key of requiredFinancials) {
    const value = financials[key];
    if (String(value ?? "").trim() === "") {
      throw new Error(`Missing financial field: ${key}`);
    }
  }

  if (String(financials.project_country_code || "").trim().length !== 3) {
    throw new Error("Country code must be exactly 3 characters.");
  }

  const visibility = String(state?.visibility ?? financials.visibility ?? "").trim().toLowerCase();
  if (!visibility) {
    throw new Error("Project visibility is required.");
  }

  if (!["private", "unlisted", "public"].includes(visibility)) {
    throw new Error("Project visibility must be one of: Private, Unlisted, Public.");
  }

  coerceBoolean(state?.public_investment_progress ?? financials.public_investment_progress, "public_investment_progress", true);

  assertDateRange(financials.start_date, financials.end_date);

  if (!state.media.thumbnail) {
    throw new Error("Thumbnail is required.");
  }

  for (const localization of LOCALIZATIONS) {
    const content = state.projectContent[localization];
    if (!content.title.trim()) throw new Error(`Missing ${localization} title.`);
    if (!content.asset_type.trim()) throw new Error(`Missing ${localization} asset type.`);
    if (!content.short_description.trim()) throw new Error(`Missing ${localization} short description.`);
    if (!content.long_description.trim()) throw new Error(`Missing ${localization} long description.`);
  }
}

function assertDateRange(startDate, endDate) {
  const start = String(startDate || "").trim();
  const end = String(endDate || "").trim();
  const startValue = start ? new Date(start) : null;
  const endValue = end ? new Date(end) : null;

  if (start && (!startValue || Number.isNaN(startValue.getTime()))) {
    throw new Error("Start date must use a valid date-time format.");
  }

  if (end && (!endValue || Number.isNaN(endValue.getTime()))) {
    throw new Error("End date must use a valid date-time format.");
  }

  if (startValue && endValue && startValue > endValue) {
    throw new Error("End date must be on or after start date.");
  }
}

function toIsoDateTime(dateValue) {
  const normalized = String(dateValue || "").trim();
  if (!normalized) return null;
  return new Date(normalized).toISOString();
}

function coerceBoolean(value, fieldName, defaultValue = true) {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  throw new Error(`${fieldName} must be a boolean.`);
}

/** @param {ProjectWizardState} state */
export async function submitWizard(state) {
  assertRequired(state);

  let issuerId = String(state?.existingIssuerId || "").trim();

  if (!issuerId) {
    const issuerBaseRes = await fetch("/api/issuers", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({}),
    });

    const issuerBasePayload = await parseResponse(issuerBaseRes, "Failed to create issuer");
    const issuerBaseData = extractData(issuerBasePayload);
    issuerId = issuerBaseData?.issuer_id || issuerBaseData?.id || "";
  }

  if (!issuerId) {
    throw new Error("Issuer was not resolved.");
  }

  await Promise.all(
    LOCALIZATIONS.map(async (localization) => {
      const issuerPayload = resolveIssuerPayload(state.issuer, localization);
      await upsertIssuerLocalization(issuerId, {
        localization,
        name: issuerPayload.name,
        about: issuerPayload.about,
        location: issuerPayload.location,
        industry: issuerPayload.industry,
      });
    }),
  );

  await uploadIssuerLogo(issuerId, state?.issuerLogo || null);

  const projectRes = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      token_price: Number(state.projectFinancials.token_price),
      token_premium: Number(state.projectFinancials.token_premium),
      currency: state.projectFinancials.currency.trim().toLowerCase(),
      min_investment: 1,
      max_investment: 1000000,
      visibility: String((state?.visibility ?? state?.projectFinancials?.visibility) || "").trim() || null,
      public_investment_progress: coerceBoolean(
        state?.public_investment_progress ?? state?.projectFinancials?.public_investment_progress,
        "public_investment_progress",
        true,
      ),
      start_date: toIsoDateTime(state?.projectFinancials?.start_date),
      end_date: toIsoDateTime(state?.projectFinancials?.end_date),
      token: {
        quantity: Number(state.projectFinancials.token_quantity),
        friendly_name: state.projectFinancials.token_friendly_name.trim(),
        description: state.projectFinancials.token_description.trim(),
        project_label: state.projectFinancials.project_label.trim(),
        project_type: state.projectFinancials.project_type.trim(),
        project_country_code: state.projectFinancials.project_country_code.trim().toUpperCase(),
        issuer_name: resolveIssuerPayload(state.issuer, "en-US").name,
        issuer_id: issuerId,
      },
    }),
  });

  const projectPayload = await parseResponse(projectRes, "Failed to create project");
  const projectData = extractData(projectPayload);
  const projectId = projectData?.project_id || projectData?.id;

  if (!projectId) {
    throw new Error("Project created but project_id was not returned.");
  }

  await Promise.all(
    LOCALIZATIONS.map(async (localization) => {
      const content = state.projectContent[localization];
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          localization,
          title: content.title,
          asset_type: content.asset_type,
          short_description: content.short_description,
          long_description: content.long_description,
          tags: toTags(content.tags),
        }),
      });

      await parseResponse(res, `Failed to create project localization (${localization})`);
    }),
  );

  const imageUploads = [
    ...(state.media.thumbnail ? [{ file: state.media.thumbnail, isThumbnail: true }] : []),
    ...state.media.galleryImages.map((file) => ({ file, isThumbnail: false })),
  ];

  await Promise.all(
    imageUploads.flatMap(({ file, isThumbnail }) =>
      LOCALIZATIONS.map(async (localization) => {
        const formData = new FormData();
        formData.append("upload_image", file);
        formData.append("localization", localization);
        formData.append("image_description", isThumbnail ? "Thumbnail" : "Gallery Image");
        formData.append("image_name", String(file?.name || (isThumbnail ? "thumbnail" : "gallery-image")));
        formData.append("name", String(file?.name || (isThumbnail ? "thumbnail" : "gallery-image")));
        formData.append("is_tumbnail", isThumbnail ? "true" : "false");
        formData.append("is_thumbnail", isThumbnail ? "true" : "false");

        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization/image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        await parseResponse(res, `Failed to upload image (${localization})`);
      }),
    ),
  );

  await Promise.all(
    state.media.resources.flatMap((resource) =>
      LOCALIZATIONS.map(async (localization) => {
        const formData = new FormData();
        formData.append("upload_resource", resource.file);
        formData.append("localization", localization);
        formData.append("resource_title", resource.title);
        formData.append("resource_name", String(resource?.file?.name || "resource-file"));
        formData.append("name", String(resource?.file?.name || "resource-file"));

        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization/resource`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        await parseResponse(res, `Failed to upload resource (${localization})`);
      }),
    ),
  );

  return {
    issuerId,
    projectId,
  };
}

function assertRequiredUpdateState(state) {
  if (!String(state?.projectId || "").trim()) throw new Error("projectId is required.");
  if (!String(state?.issuerId || "").trim()) throw new Error("issuerId is required.");

  if (!String(state?.issuer?.["en-US"]?.name || "").trim()) throw new Error("issuer.en-US.name is required.");
  if (String(state?.issuer?.["en-US"]?.name || "").trim().length < 5 || String(state?.issuer?.["en-US"]?.name || "").trim().length > 40) {
    throw new Error("issuer.en-US.name must be between 5 and 40 characters.");
  }
  if (!String(state?.issuer?.["en-US"]?.about || "").trim()) throw new Error("issuer.en-US.about is required.");
  if (!String(state?.issuer?.["en-US"]?.location || "").trim()) throw new Error("issuer.en-US.location is required.");
  if (!String(state?.issuer?.["en-US"]?.industry || "").trim()) throw new Error("issuer.en-US.industry is required.");

  const pf = state?.projectFinancials || {};
  assertDateRange(pf.start_date, pf.end_date);

  const visibility = String(state?.visibility ?? pf.visibility ?? "").trim().toLowerCase();
  if (visibility && !["private", "unlisted", "public"].includes(visibility)) {
    throw new Error("Project visibility must be one of: Private, Unlisted, Public.");
  }

  coerceBoolean(state?.public_investment_progress ?? pf.public_investment_progress, "public_investment_progress", true);

  const requiredFinancialKeys = ["token_price", "token_premium", "min_investment", "max_investment"];
  for (const key of requiredFinancialKeys) {
    if (String(pf[key] ?? "").trim() === "") {
      throw new Error(`projectFinancials.${key} is required.`);
    }
  }

  for (const localization of LOCALIZATIONS) {
    const content = state?.projectContent?.[localization] || {};
    if (!String(content.title || "").trim()) throw new Error(`projectContent.${localization}.title is required.`);
    if (!String(content.asset_type || "").trim()) throw new Error(`projectContent.${localization}.asset_type is required.`);
    if (!String(content.short_description || "").trim()) throw new Error(`projectContent.${localization}.short_description is required.`);
    if (!String(content.long_description || "").trim()) throw new Error(`projectContent.${localization}.long_description is required.`);
  }
}

async function uploadNewImagesForProject(projectId, newMedia) {
  const uploads = [
    ...(newMedia?.thumbnail ? [{ file: newMedia.thumbnail, isThumbnail: true }] : []),
    ...((newMedia?.newGalleryImages || []).map((file) => ({ file, isThumbnail: false }))),
  ];

  if (uploads.length === 0) return;

  await Promise.all(
    uploads.flatMap(({ file, isThumbnail }) =>
      LOCALIZATIONS.map(async (localization) => {
        const formData = new FormData();
        formData.append("upload_image", file);
        formData.append("localization", localization);
        formData.append("image_description", isThumbnail ? "Thumbnail" : "Gallery Image");
        formData.append("image_name", String(file?.name || (isThumbnail ? "thumbnail" : "gallery-image")));
        formData.append("name", String(file?.name || (isThumbnail ? "thumbnail" : "gallery-image")));
        formData.append("is_tumbnail", isThumbnail ? "true" : "false");
        formData.append("is_thumbnail", isThumbnail ? "true" : "false");

        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization/image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        await parseResponse(response, `Failed to upload image (${localization})`);
      }),
    ),
  );
}

async function uploadNewResourcesForProject(projectId, newMedia) {
  const resources = newMedia?.newResources || [];
  if (resources.length === 0) return;

  await Promise.all(
    resources.flatMap((resource) =>
      LOCALIZATIONS.map(async (localization) => {
        const formData = new FormData();
        formData.append("upload_resource", resource.file);
        formData.append("localization", localization);
        formData.append("resource_title", resource.title);
        formData.append("resource_name", String(resource?.file?.name || "resource-file"));
        formData.append("name", String(resource?.file?.name || "resource-file"));

        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization/resource`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        await parseResponse(response, `Failed to upload resource (${localization})`);
      }),
    ),
  );
}

async function parseDeleteResult(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  const message = typeof payload === "string"
    ? payload
    : payload?.message || payload?.error || "";

  return {
    ok: response.ok,
    status: response.status,
    message: String(message || "").trim(),
  };
}

function isDeleteNotFound(result) {
  if (!result || result.ok) return false;
  if (result.status === 404) return true;
  return /no\s+(image|resource)|not\s+found|already\s+deleted/i.test(String(result.message || ""));
}

async function deleteWithLocalizationFallback(endpoint, bodyFactory, fallbackMessage) {
  let lastError = "";
  let sawNotFound = false;

  for (const localization of LOCALIZATIONS) {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(bodyFactory(localization)),
    });

    const result = await parseDeleteResult(response);
    if (result.ok) return;

    if (isDeleteNotFound(result)) {
      sawNotFound = true;
      continue;
    }

    lastError = result.message || fallbackMessage;
  }

  if (sawNotFound && !lastError) return;
  throw new Error(lastError || fallbackMessage);
}

function toDeleteProgressKey(type, id) {
  if (type === "thumbnail") return "thumbnail";
  return `${type}:${String(id || "")}`;
}

/** @param {UpdateProjectState} state */
export async function updateProject(state, options = {}) {
  assertRequiredUpdateState(state);
  const onDeleteProgress = typeof options?.onDeleteProgress === "function"
    ? options.onDeleteProgress
    : null;

  await Promise.all(
    LOCALIZATIONS.map(async (localization) => {
      const issuerPayload = resolveIssuerPayload(state.issuer, localization);
      await upsertIssuerLocalization(state.issuerId, {
        localization,
        name: issuerPayload.name,
        about: issuerPayload.about,
        location: issuerPayload.location,
        industry: issuerPayload.industry,
      });
    }),
  );

  const financialResponse = await fetch(`/api/projects/${encodeURIComponent(state.projectId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      token_price: Number(state.projectFinancials.token_price),
      token_premium: Number(state.projectFinancials.token_premium),
      min_investment: 1,
      max_investment: 1000000,
      visibility: String((state?.visibility ?? state?.projectFinancials?.visibility) || "").trim() || null,
      public_investment_progress: coerceBoolean(
        state?.public_investment_progress ?? state?.projectFinancials?.public_investment_progress,
        "public_investment_progress",
        true,
      ),
      start_date: toIsoDateTime(state?.projectFinancials?.start_date),
      end_date: toIsoDateTime(state?.projectFinancials?.end_date),
    }),
  });

  await parseResponse(financialResponse, "Failed to update project financials");

  await Promise.all(
    LOCALIZATIONS.map(async (localization) => {
      const content = state.projectContent[localization];
      const response = await fetch(`/api/projects/${encodeURIComponent(state.projectId)}/localization`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          localization,
          title: content.title,
          asset_type: content.asset_type,
          short_description: content.short_description,
          long_description: content.long_description,
          tags: toTags(content.tags),
        }),
      });

      await parseResponse(response, `Failed to update project localization (${localization})`);
    }),
  );

  const imageIds = state.mediaToRemove?.imageIds || [];
  const deleteThumbnail = Boolean(state.mediaToRemove?.deleteThumbnail);
  const imageEndpoint = `/api/projects/${encodeURIComponent(state.projectId)}/localization/image`;

  if (deleteThumbnail) {
    const progressKey = toDeleteProgressKey("thumbnail", null);
    onDeleteProgress?.({ phase: "start", type: "thumbnail", id: null, key: progressKey });
    await deleteWithLocalizationFallback(
      imageEndpoint,
      (localization) => ({ localization, is_thumbnail: true }),
      "Failed to delete thumbnail",
    );
    onDeleteProgress?.({ phase: "end", type: "thumbnail", id: null, key: progressKey });
  }

  await Promise.all(
    imageIds.map(async (imageId) => {
      const progressKey = toDeleteProgressKey("image", imageId);
      onDeleteProgress?.({ phase: "start", type: "image", id: imageId, key: progressKey });
      await deleteWithLocalizationFallback(
        imageEndpoint,
        (localization) => ({ localization, is_thumbnail: false, image_id: imageId }),
        "Failed to delete image",
      );
      onDeleteProgress?.({ phase: "end", type: "image", id: imageId, key: progressKey });
    }),
  );

  const resourceIds = state.mediaToRemove?.resourceIds || [];
  const resourceEndpoint = `/api/projects/${encodeURIComponent(state.projectId)}/localization/resource`;
  await Promise.all(
    resourceIds.map(async (resourceId) => {
      const progressKey = toDeleteProgressKey("resource", resourceId);
      onDeleteProgress?.({ phase: "start", type: "resource", id: resourceId, key: progressKey });
      await deleteWithLocalizationFallback(
        resourceEndpoint,
        (localization) => ({ localization, resource_id: resourceId }),
        "Failed to delete resource",
      );
      onDeleteProgress?.({ phase: "end", type: "resource", id: resourceId, key: progressKey });
    }),
  );

  await Promise.all([
    uploadNewImagesForProject(state.projectId, state.newMedia || {}),
    uploadNewResourcesForProject(state.projectId, state.newMedia || {}),
  ]);

  return {
    projectId: state.projectId,
    issuerId: state.issuerId,
  };
}
