"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage, content as i18nContent } from "../../../../../context/LanguageContext";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import AssetAmountCard from "@/components/assets/AssetAmountCard";
import { useRouter } from "next/navigation";

const templates = [
  {
    id: "agriculture",
    title: "Agriculture",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
  },
  {
    id: "minerals",
    title: "Minerals",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
  },
  {
    id: "template",
    title: "Token template",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
  },
];

export default function AssetSetUpPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateParam = searchParams.get("template");
  const template = useMemo(
    () => templates.find((item) => item.id === templateParam) || templates[0],
    [templateParam]
  );

  // Inputs now empty by default
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const fileInputRef = useRef(null);
  const photosRef = useRef([]);
  const [assetDetails, setAssetDetails] = useState({});

  const getDraftStorageKey = () => {
    if (typeof window === "undefined") return "draftTokens";
    const userKey = localStorage.getItem("userEmail") || localStorage.getItem("loggedInUser") || "";
    return userKey ? `draftTokens:${userKey}` : "draftTokens";
  };

  const safeParse = (value) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => {
        if (photo.url?.startsWith("blob:")) URL.revokeObjectURL(photo.url);
      });
    },
    []
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const newPhoto = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: file.name || "New image",
        url: dataUrl,
        dataUrl,
      };

      setPhotos((prev) => {
        if (replaceIndex !== null && replaceIndex >= 0 && replaceIndex < prev.length) {
          const updated = [...prev];
          updated[replaceIndex] = newPhoto;
          return updated;
        }
        return [...prev, newPhoto];
      });

      setReplaceIndex(null);
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = (index = null) => {
    setReplaceIndex(index);
    fileInputRef.current?.click();
  };

  const persistDraft = (draft) => {
    const storageKey = getDraftStorageKey();
    const baseKey = "draftTokens";

    const trySet = (key, payload) => {
      const existing = safeParse(localStorage.getItem(key));
      const trimmed = existing.slice(-9);
      const updated = [...trimmed.filter((d) => d.id !== draft.id), payload];
      try {
        localStorage.setItem(key, JSON.stringify(updated));
        return true;
      } catch (err) {
        try {
          // clear the key and retry with only the new payload to avoid old bloat (e.g., old base64 images)
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify([payload]));
          return true;
        } catch {
          return false;
        }
      }
    };

    const lightDraft = { ...draft, photos: (draft.photos || []).map((p) => ({ name: p.name })) };

    const okPrimary = trySet(storageKey, lightDraft);
    const okBase = trySet(baseKey, lightDraft);

    if ((!okPrimary || !okBase) && typeof window !== "undefined") {
      window.alert("Could not fully save draft due to storage limits. Try removing older drafts.");
    }
  };

  const handleCreateToken = () => {
    const draft = {
      id: Date.now().toString(),
      name: tokenName || "Untitled token",
      description: tokenDescription || "",
      photos: photos.map((p) => ({ name: p.name, url: p.dataUrl || p.url })),
      assetDetails,
      templateId: template.id,
      createdAt: new Date().toISOString(),
      status: "Drafted",
    };

    if (typeof window !== "undefined") {
      persistDraft(draft);
    }

    router.push(`/neuro-assets/tokenPreview?id=${draft.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6">
      <StepCard t={t} />

      <div className="mt-6 space-y-4">
        <AssetTypeCard template={template} />
        <TokenDetailsCard
          tokenName={tokenName}
          tokenDescription={tokenDescription}
          onNameChange={setTokenName}
          onDescriptionChange={setTokenDescription}
        />
        <TokenPhotosCard
          photos={photos}
          onAdd={() => openFileDialog(null)}
          onChange={(idx) => openFileDialog(idx)}
          onRemove={handleRemove}
          onFileChange={handleFileChange}
          fileInputRef={fileInputRef}
        />
        <AssetAmountCard onChange={setAssetDetails} />
        <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--brand-text)]">All done?</h2>
              <p className="mt-2 max-w-3xl text-base text-[var(--brand-text-secondary)]">
                Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac
                pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas. Diam amet aliquam in elit proin rhoncus
                nunc nam sed. Pretium iaculis nibh rutrum mauris aliquet. Integer bibendum phasellus diam et adipiscing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateToken}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8F40D4] px-6 py-3 text-base font-semibold text-white shadow-sm"
            >
              Create token
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ t }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Step 2</p>
      <h1 className="mt-1 text-2xl font-semibold text-[var(--brand-text)]">
        {t.assetSetup?.title || "Set up token variables and info"}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-[var(--brand-text-secondary)]">
        Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac
        pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas. Diam amet aliquam in elit proin rhoncus
        nunc nam sed. Pretium iaculis nibh rutrum mauris aliquet. Integer bibendum phasellus diam et adipiscing.
      </p>
    </div>
  );
}

function AssetTypeCard({ template }) {
  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Asset type</p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--brand-text)]">{template.title}</h2>

      <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
        <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Description</p>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">{template.description}</p>
      </div>
    </div>
  );
}

function TokenDetailsCard({ tokenName, tokenDescription, onNameChange, onDescriptionChange }) {
  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[var(--brand-text)]">Token name and description</h3>

      <div className="mt-4 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--brand-text-secondary)]">Token name</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter token name"
            className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-sm text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:ring-2 focus:ring-[var(--brand-primary,#8F40D4)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--brand-text-secondary)]">Token description</label>
          <textarea
            value={tokenDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={6}
            placeholder="Enter token description"
            className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-sm text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:ring-2 focus:ring-[var(--brand-primary,#8F40D4)]"
          />
        </div>
      </div>
    </div>
  );
}

function TokenPhotosCard({ photos, onAdd, onChange, onRemove, onFileChange, fileInputRef }) {
  const stripRef = useRef(null);
  const maxPhotos = 5;
  const canAddMore = photos.length < maxPhotos;

  const scrollStrip = (direction) => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--brand-text)]">Token photos</h3>
        <div className="hidden items-center gap-2 text-[var(--brand-text-secondary)] sm:flex">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)]"
            onClick={() => scrollStrip(-1)}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)]"
            onClick={() => scrollStrip(1)}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="relative">
          <div
            ref={stripRef}
            className="flex gap-3 overflow-x-auto pb-2 pr-6"
            style={{ scrollBehavior: "smooth" }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)]"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={onAdd}
                className="flex h-36 w-36 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text-secondary)] transition hover:border-[var(--brand-primary,#8F40D4)] hover:text-[var(--brand-primary,#8F40D4)]"
              >
                <Upload className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[var(--brand-navbar)] to-transparent" />
        </div>

        <div className="space-y-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="flex items-center justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-[var(--brand-text-secondary)]">≡</span>
                <div>
                  <p className="text-[var(--brand-text-secondary)]">Image</p>
                  <p className="font-semibold text-[var(--brand-text)] break-all">{photo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => onRemove(idx)}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="text-blue-600"
            onClick={() => onChange(idx)}
            >
              Change
            </button>
          </div>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onAdd}
      disabled={!canAddMore}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary-light,#E1D1FF)] px-4 py-3 text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)] disabled:opacity-60"
    >
      <Upload className="h-4 w-4" />
      Upload new image
    </button>
  </div>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={onFileChange}
  />
</div>
  );
}
