"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { TabNavigation } from "@/components/shared/TabNavigation";
import { FaRegFileAlt, FaCertificate } from "react-icons/fa";

const placeholderImages = Array.from({ length: 4 }).map((_, idx) => ({
  id: `ph-${idx}`,
  url: "https://via.placeholder.com/300x200?text=%5B+IMAGE+%5D",
}));

export default function TokenPreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const tab = searchParams.get("tab") || "overview";
  const [draft, setDraft] = useState(null);

  const getDraftStorageKeys = () => {
    if (typeof window === "undefined") return ["draftTokens"];
    const userKey = localStorage.getItem("userEmail") || localStorage.getItem("loggedInUser") || "";
    const primary = userKey ? `draftTokens:${userKey}` : "draftTokens";
    return [primary, "draftTokens"];
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const keys = getDraftStorageKeys();
    const allDrafts = keys.flatMap((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        return [];
      }
    });
    const found = allDrafts.find((d) => d.id === id) || allDrafts[allDrafts.length - 1];
    setDraft(found || null);
  }, [id]);

  const images = useMemo(() => {
    const clean = (draft?.photos || []).map((p, idx) => ({ id: p.name || idx, url: p.url || p.dataUrl })).filter((p) => !!p.url);
    if (!clean.length) return placeholderImages;
    return clean;
  }, [draft]);

  const formatDate = (obj = {}) => {
    const day = obj.day || "";
    const month = obj.month || "";
    const year = obj.year || "";
    if (!day && !month && !year) return "Not provided";
    return [day || "DD", month || "MM", year || "YYYY"].join("/");
  };

  const detailData = useMemo(() => {
    const a = draft?.assetDetails || {};
    const unitVolumeNumber = parseFloat(a.unitVolume);
    const totalUnitsNumber = parseFloat(a.totalUnitAmount);
    const unitVolumeStr = a.unitVolume ? `${a.unitVolume} ${a.unitMeasure || ""}`.trim() : "Not provided";
    const totalUnitStr = a.totalUnitAmount ? `${a.totalUnitAmount} ${a.unitMeasure || ""}`.trim() : "Not provided";
    const totalVolumeCalc =
      !isNaN(unitVolumeNumber) && !isNaN(totalUnitsNumber) ? (unitVolumeNumber * totalUnitsNumber).toFixed(2) : "";
    const totalVolumeStr =
      a.definition === "volume"
        ? `${a.totalVolume || "Not provided"} ${a.totalVolumeMeasure || ""}`.trim()
        : totalVolumeCalc
        ? `${totalVolumeCalc} ${a.unitMeasure || ""}`
        : "Not provided";

    return {
      orderName: draft?.name || "Untitled token",
      comment: draft?.description || "No description provided.",
      orderType: a.definition === "volume" ? "Volume based" : "Unit based",
      orderQuantity: totalVolumeStr,
      orderDate: formatDate(a.start),
      orderedBy: "Draft creator",
      created: draft?.createdAt ? new Date(draft.createdAt).toISOString().slice(0, 16).replace("T", ", ") : "Now",
      createdBy: "You",
      production: {
        facility: a.facilityName || "Not provided",
        method: a.definition === "volume" ? "Total volume" : "Unit volume",
        start: formatDate(a.start),
        end: formatDate(a.end),
        location: a.location || "Not provided",
      },
      price: {
        agreement: `${a.pricePerUnit || "--"} ${a.priceCurrency || ""}`.trim(),
        total: `${a.totalPrice || "--"} ${a.priceCurrency || ""}`.trim(),
        minPurchase: a.minPurchaseAmount ? `${a.minPurchaseAmount} ${a.totalVolumeMeasure || ""}` : "Not provided",
      },
      company: {
        totalPrice: `${a.totalPrice || "--"} ${a.priceCurrency || ""}`.trim(),
        paymentMethod: a.paymentMethod || "Not provided",
        paymentDue: formatDate(a.end),
        paymentReceived: "Not provided",
      },
    };
  }, [draft]);

  if (!draft) {
    return (
      <div className="min-h-screen bg-[var(--brand-background)] p-6 text-[var(--brand-text)]">
        <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
          <p className="text-lg">No token data found.</p>
          <button
            type="button"
            onClick={() => router.push("/neuro-assets/assetSetUp")}
            className="mt-4 inline-flex items-center rounded-lg bg-[#8F40D4] px-4 py-2 text-sm font-semibold text-white"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6 text-[var(--brand-text)]">
      <TabNavigation
        tab={tab}
        id={id || "draft"}
        gridCols={"grid-cols-2"}
        tabArray={[
          { title: "Token overview", href: "/neuro-assets/tokenPreview", tabDesination: "overview", icon: FaRegFileAlt, tabRef: "overview" },
          { title: "Sales", href: "/neuro-assets/tokenPreview", tabDesination: "sales", icon: FaCertificate, tabRef: "sales" },
        ]}
        queryId
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-4">
        {tab === "sales" ? (
          <>
            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
                <h1 className="font-semibold text-xl mb-5">Sales</h1>
                <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-6 text-center text-[var(--brand-text-secondary)]">
                  Sales will appear here once the token is published.
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <StatusCard title="Sales status" value="0%" subtitle="Not started" />
              <StatusCard title="Average daily sales" value="0" subtitle="" />
              <div className="rounded-2xl bg-[var(--brand-navbar)] p-4 shadow-md">
                <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Popular regions</p>
                <ol className="mt-3 space-y-1 text-sm text-[var(--brand-text-secondary)]">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <li key={n}>{n} -</li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-3 space-y-5">
              <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
                <h1 className="text-xl font-semibold">{draft.name}</h1>
                <p className="text-sm text-[var(--brand-text-secondary)]">{draft.description || "[Name of issuer]"}</p>

                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)]"
                    >
                      <img
                        src={img.url}
                        alt={draft.name}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-1">
                  <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Description</p>
                  <p className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text)]">
                    {draft.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md space-y-3">
                <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Asset type</p>
                <h2 className="text-xl font-semibold text-[var(--brand-text)]">Agriculture</h2>
                <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text-secondary)]">
                  {draft.description || "No description provided."}
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
                <Image
                  src="/brazilMap.svg"
                  alt="Map"
                  width={800}
                  height={200}
                  className="h-auto w-full rounded-xl border border-[var(--brand-border)]"
                  unoptimized
                />
                <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text)]">
                  <h3 className="text-base font-semibold text-[var(--brand-text-secondary)]">Order details</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Row label="Order name" value={detailData.orderName} />
                    <Row label="Comment" value={detailData.comment} />
                    <Row label="Order type" value={detailData.orderType} />
                    <Row label="Order quantity" value={detailData.orderQuantity} />
                    <Row label="Order date" value={detailData.orderDate} />
                    <Row label="Ordered by" value={detailData.orderedBy} />
                    <Row label="Created" value={detailData.created} />
                    <Row label="Created by" value={detailData.createdBy} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text)]">
                  <h3 className="text-base font-semibold text-[var(--brand-text-secondary)]">Production process</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Row label="Facility" value={detailData.production.facility} />
                    <Row label="Location" value={detailData.production.location} />
                    <Row label="Method" value={detailData.production.method} />
                    <Row label="Start date" value={detailData.production.start} />
                    <Row label="End date" value={detailData.production.end} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text)]">
                  <h3 className="text-base font-semibold text-[var(--brand-text-secondary)]">Price agreement</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Row label="Price per unit" value={detailData.price.agreement} />
                    <Row label="Total price" value={detailData.price.total} />
                    <Row label="Minimum purchase amount" value={detailData.price.minPurchase} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm text-[var(--brand-text)]">
                  <h3 className="text-base font-semibold text-[var(--brand-text-secondary)]">Company Information</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Row label="Total price" value={detailData.company.totalPrice} />
                    <Row label="Payment method" value={detailData.company.paymentMethod} />
                    <Row label="Payment due" value={detailData.company.paymentDue} />
                    <Row label="Payment received" value={detailData.company.paymentReceived} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--brand-navbar)] p-4 shadow-md">
                <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Publish status</p>
                <select
                  value="Drafted"
                  className="mt-2 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
                  disabled
                >
                  <option>Drafted</option>
                </select>
                <button className="mt-3 w-full rounded-lg bg-[var(--brand-primary-light,#E1D1FF)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)]">
                  Save changes
                </button>
              </div>

              <StatusCard title="Asset status" value="0%" subtitle="Not started" />
              <StatusCard title="Sales status" value="0%" subtitle="Not started" />

              <div className="rounded-2xl bg-[var(--brand-navbar)] p-4 shadow-md">
                <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Token certificate template</p>
                <div className="mt-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-center text-sm text-[var(--brand-text-secondary)]">
                  Certificate placeholder
                </div>
                <button className="mt-3 w-full rounded-lg bg-[var(--brand-primary-light,#E1D1FF)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)]">
                  Edit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-text)]">{title}</p>
          <p className="text-xs text-[var(--brand-text-secondary)]">{subtitle}</p>
        </div>
        <Activity className="h-4 w-4 text-[var(--brand-text-secondary)]" />
      </div>
      <p className="mt-3 text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
      <div className="mt-2 h-2 rounded-full bg-[var(--brand-background)]">
        <div className="h-2 w-0 rounded-full bg-[var(--brand-primary,#8F40D4)]" />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--brand-border)] pb-2 last:border-none last:pb-0">
      <p className="text-[var(--brand-text-secondary)]">{label}:</p>
      <p className="flex-1 text-right font-semibold text-[var(--brand-text)]">{value}</p>
    </div>
  );
}
