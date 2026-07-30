"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, Search, Settings2, ShieldCheck, X } from "lucide-react";
import { useLanguage, content } from "../../../../context/LanguageContext";
import PendingApplications from "../../../components/access/dashboard/PendingApplications";
import { getIdentityDisplayName } from "@/lib/identityFields";

const emptyIdentity = { properties: {}, attachments: [] };

function normalizeIdentity(identity) {
  if (!identity) return emptyIdentity;

  const attachments = identity.attachments || identity.Attachments || [];
  return {
    id: identity.id || identity.Id || identity.legalIdentity || "",
    account: identity.account || identity.Account || identity.userName || "",
    created: identity.created || identity.Created || identity.createdDate || "",
    state: identity.state || identity.State || identity.latestLegalIdState || "",
    properties: identity.properties || identity.Properties || {},
    attachments: Array.isArray(attachments)
      ? attachments.map((attachment) => ({
          data: attachment.data,
          fileName: attachment.fileName || attachment.FileName,
        }))
      : [],
  };
}

function belongsToIdentityOwner(candidate, owner) {
  const candidateAccount = String(candidate?.account || "").trim().toLowerCase();
  const ownerAccount = String(owner?.account || "").trim().toLowerCase();
  if (candidateAccount && ownerAccount) return candidateAccount === ownerAccount;

  const candidateEmail = String(candidate?.properties?.EMAIL || "").trim().toLowerCase();
  const ownerEmail = String(owner?.properties?.EMAIL || "").trim().toLowerCase();
  return Boolean(candidateEmail && ownerEmail && candidateEmail === ownerEmail);
}

function getDate(value) {
  if (!value) return "Not available";
  const numericValue = Number(value);
  const date = Number.isFinite(numericValue) && numericValue > 0 && numericValue < 100000000000
    ? new Date(numericValue * 1000)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("sv-SE");
}

function getStateTone(state) {
  const value = String(state || "").toLowerCase();
  if (value.includes("created") || value.includes("pending")) return "pending";
  if (value.includes("obsolete") || value.includes("reject")) return "obsolete";
  if (value.includes("compromised")) return "warning";
  return "active";
}

function stateLabel(state) {
  const value = String(state || "");
  if (value.toLowerCase().includes("created")) return "Pending";
  if (value.toLowerCase().includes("approved")) return "Active";
  return value || "Unknown";
}

function StatusBadge({ state }) {
  const tone = getStateTone(state);
  const colors = {
    active: "bg-[#d8ebe8] text-[#17635e]",
    pending: "bg-[#fde9dc] text-[#b96b31]",
    obsolete: "bg-[#f9dce1] text-[#c64d63]",
    warning: "bg-amber-100 text-amber-700",
  };
  return <span className={`ml-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}>{stateLabel(state)}</span>;
}

function ManageButton({ children, onClick, subdued = false, tokenStyle = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
        tokenStyle
          ? "bg-[#f5f6f7] text-[#803bb1] hover:bg-[#eaedef]"
          : subdued
          ? "bg-[#f5f6f7] text-[#4d555b] hover:bg-[#eaedef]"
          : "bg-[#efe0f8] text-[#803bb1] hover:bg-[#e8d2f4]"
      }`}
    >
      {subdued ? <Info size={14} /> : <Settings2 size={14} />}
      {children}
    </button>
  );
}

function ProfilePhoto({ identity }) {
  const photo = identity?.attachments?.find((attachment) => attachment.fileName === "ProfilePhoto.jpg");
  if (photo?.data) {
    return <img src={`data:image/jpeg;base64,${photo.data}`} alt="Profile" className="h-28 w-28 shrink-0 rounded-lg object-cover" />;
  }
  return <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-[#e1e4e6] text-[#7a8085]"><ShieldCheck size={38} /></div>;
}

function IdentitySummary({ identity, application = false, onManage, onInfo }) {
  const displayName = getIdentityDisplayName(identity);
  return (
    <article className={application ? "rounded-md border border-[#e4e6e8] p-4" : ""}>
      <p className="text-xs text-[#7a8085]">Digital ID</p>
      <h3 className="truncate text-base font-semibold">{displayName}</h3>
      <div className="my-3 border-t border-[#e8eaec]" />
      <p className="text-xs text-[#7a8085]">{application ? "Application made" : "ID created"}: {getDate(identity.created)}</p>
      <p className="mt-2 text-xs text-[#7a8085]">Status:<StatusBadge state={identity.state} /></p>
      <ManageButton onClick={onManage || onInfo} subdued={Boolean(onInfo)}>{onInfo ? "Info" : application ? "Manage application" : "Manage"}</ManageButton>
    </article>
  );
}

function tokenDetails(token) {
  const item = token?.token || token || {};
  return {
    id: item.id || item.Id || token?.id || token?.Id || token?.project_id || "",
    name: item.friendly_name || item.name || item.project_label || item.token_name || "Access token",
    issuer: item.issuer_name || item.issuer || token?.issuer_name || "",
    created: item.created || item.created_at || token?.created || token?.start_date || "",
    expires: item.expires || item.expiry_date || token?.end_date || "",
    state: item.state || item.status || token?.status || "Active",
  };
}

function AccessTokenCard({ token, onManage }) {
  const details = tokenDetails(token);
  return (
    <article className="rounded-md border border-[#e4e6e8] bg-white p-4">
      <div className="flex gap-4">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e1e4e6] text-[#7a8085]"><ShieldCheck size={17} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-[#7a8085]">Access Token</p>
          <h3 className="truncate text-sm font-semibold">{details.name}</h3>
          {details.issuer && <p className="truncate text-[10px] text-[#7a8085]">{details.issuer}</p>}
          <div className="my-3 border-t border-[#e8eaec]" />
          <p className="text-[10px] text-[#7a8085]">Created: {getDate(details.created)}</p>
          <p className="text-[10px] text-[#7a8085]">Expires: {getDate(details.expires)}</p>
          <p className="mt-2 text-[10px] text-[#7a8085]">Status:<StatusBadge state={details.state} /></p>
        </div>
      </div>
      <ManageButton onClick={() => onManage(details.id)} tokenStyle>Manage</ManageButton>
    </article>
  );
}

function DetailRow({ label, value, link = false }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 border-t border-[#e1e4e6] py-3 text-xs">
      <dt className="text-[#70777c]">{label}</dt>
      <dd className={`min-w-0 break-words font-medium ${link ? "text-[#2765ad] underline" : "text-[#31393e]"}`}>{value || "-"}</dd>
    </div>
  );
}

function DigitalIdentityModal({ identity, previousIds, onClose }) {
  const options = [identity, ...previousIds].filter((item, index, values) => item?.id && values.findIndex((value) => value.id === item.id) === index);
  const [selectedId, setSelectedId] = useState(identity?.id || "");
  const selectedIdentity = options.find((item) => item.id === selectedId) || identity;
  const properties = selectedIdentity?.properties || {};
  const attachments = selectedIdentity?.attachments || [];
  const displayName = getIdentityDisplayName(selectedIdentity);
  const address = [properties.ADDR, properties.ZIP, properties.CITY, properties.COUNTRY].filter(Boolean).join(", ");
  const created = getDate(selectedIdentity?.created);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172126]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="digital-id-modal-title">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 text-[#182127] shadow-2xl sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <h2 id="digital-id-modal-title" className="text-sm font-bold">My Digital ID</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[#687177] transition hover:bg-[#f1f3f4]" aria-label="Close digital ID details"><X size={20} /></button>
        </header>

        <label className="mt-5 block text-xs text-[#70777c]">Choose ID {previousIds.length ? `(${previousIds.length} previous ID${previousIds.length === 1 ? "" : "s"} detected)` : ""}
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[#dfe2e5] bg-white px-3 text-sm font-medium text-[#31393e] outline-none focus:border-[#803bb1]">
            {options.map((item) => <option key={item.id} value={item.id}>{getDate(item.created)} · {getIdentityDisplayName(item)} · {stateLabel(item.state)}</option>)}
          </select>
        </label>

        <div className="my-6 border-t border-[#e8eaec]" />
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProfilePhoto identity={selectedIdentity} />
          <div className="min-w-0 flex-1"><p className="text-xs text-[#70777c]">Digital ID</p><h3 className="mt-1 text-lg font-bold">{displayName}</h3><div className="my-2 border-t border-[#e1e4e6]" /><p className="text-xs text-[#70777c]">registered at {selectedIdentity?.account || "-"}</p><p className="mt-2 text-xs text-[#70777c]">Status:<StatusBadge state={selectedIdentity?.state} /></p></div>
        </section>

        <section className="mt-6"><h3 className="text-xs font-semibold text-[#70777c]">Attachments</h3>{attachments.length ? <div className="mt-3 flex flex-wrap gap-2">{attachments.map((attachment, index) => attachment.data ? <a key={`${attachment.fileName || "attachment"}-${index}`} href={`data:application/octet-stream;base64,${attachment.data}`} download={attachment.fileName || `attachment-${index + 1}`} className="flex h-20 w-20 items-center justify-center overflow-hidden rounded border border-[#dfe2e5] bg-[#f1f3f4] text-center text-[10px] text-[#70777c] hover:ring-2 hover:ring-[#803bb1]">{attachment.data.startsWith("/9j/") ? <img src={`data:image/jpeg;base64,${attachment.data}`} alt={attachment.fileName || "Attachment"} className="h-full w-full object-cover" /> : <span className="px-1">{attachment.fileName || "Attachment"}</span>}</a> : null)}</div> : <p className="mt-3 text-xs text-[#70777c]">No attachments available.</p>}</section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl bg-[#f5f6f7] p-5"><h3 className="text-sm font-bold text-[#70777c]">Identity information</h3><dl className="mt-3"><DetailRow label="First name" value={properties.FIRST} /><DetailRow label="Last name" value={properties.LAST} /><DetailRow label="Identity number" value={properties.PNR} /><DetailRow label="Nationality" value={properties.COUNTRY} /><DetailRow label="Address" value={address} /><DetailRow label="Date of birth" value={properties.DOB} /><DetailRow label="Email" value={properties.EMAIL} /><DetailRow label="Phone number" value={properties.PHONE} /></dl></section>
          <section className="rounded-2xl bg-[#f5f6f7] p-5"><h3 className="text-sm font-bold text-[#70777c]">Identity metadata</h3><dl className="mt-3"><DetailRow label="ID status" value={stateLabel(selectedIdentity?.state)} /><DetailRow label="ID number" value={selectedIdentity?.id} /><DetailRow label="Application made" value={getStateTone(selectedIdentity?.state) === "pending" ? created : "-"} /><DetailRow label="ID created" value={created} /><DetailRow label="ID approved by" value={properties.APPROVEDBY || properties.APPROVED_BY} link={Boolean(properties.APPROVEDBY || properties.APPROVED_BY)} /><DetailRow label="ID obsoleted" value={getStateTone(selectedIdentity?.state) === "obsolete" ? created : "-"} /><DetailRow label="ID obsoleted by" value={properties.OBSOLETEDBY || properties.OBSOLETED_BY} /></dl></section>
        </div>

        <footer className="mt-7 flex justify-end"><button type="button" onClick={onClose} className="h-10 min-w-28 rounded-md bg-[#f5f6f7] px-5 text-xs font-semibold text-[#31393e] transition hover:bg-[#e9ecee]">Close</button></footer>
      </section>
    </div>
  );
}

function AccessDashboard() {
  const { language } = useLanguage();
  const t = content[language];
  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-8">
      <h1 className="mb-2 text-4xl font-bold text-[var(--brand-text)]">{t?.accessDashboard?.title || "Neuro-Access Dashboard"}</h1>
      <p className="mb-8 text-md text-[var(--brand-text-secondary)]">{t?.accessDashboard?.subtitle || "Real-time identity management insights"}</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><Suspense fallback={<div>Loading pending applications...</div>}><PendingApplications /></Suspense></div>
    </div>
  );
}

function DigitalIdentityPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState(null);
  const [history, setHistory] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const storedProfile = window.sessionStorage.getItem("profile");
      const storedUser = window.sessionStorage.getItem("neuroUser");
      const profile = storedProfile ? normalizeIdentity(JSON.parse(storedProfile)) : emptyIdentity;
      const sessionUser = storedUser ? JSON.parse(storedUser) : {};
      const identityId = profile.id || sessionUser.legalId;
      const firstName = profile.properties?.FIRST;

      try {
        const requests = [
          fetch("/api/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ maxCount: 100, offset: 0 }) }),
        ];
        if (identityId) requests.unshift(fetch("/api/legalIdentity", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ legalIdentity: identityId }) }));
        if (firstName) requests.push(fetch("/api/legal-identities", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ page: 1, limit: 100, filter: { FIRST: firstName } }) }));

        const responses = await Promise.all(requests);
        const payloads = await Promise.all(responses.map(async (response) => response.ok ? response.json() : null));
        const identityPayload = identityId ? payloads.shift() : null;
        const tokenPayload = payloads.shift();
        const historyPayload = payloads.shift();
        const currentIdentity = normalizeIdentity(identityPayload?.data || profile);
        const historyItems = historyPayload?.data?.items || [];

        if (!active) return;
        setIdentity(currentIdentity.id || currentIdentity.account ? currentIdentity : null);
        setTokens(Array.isArray(tokenPayload?.data) ? tokenPayload.data : []);
        setHistory(
          historyItems
            .map(normalizeIdentity)
            .filter((item) => item.id && item.id !== currentIdentity.id && belongsToIdentityOwner(item, currentIdentity)),
        );
      } catch (error) {
        console.error("Unable to load digital identity data", error);
        if (active) setIdentity(profile.id || profile.account ? profile : null);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, []);

  const application = history.find((item) => getStateTone(item.state) === "pending") || (getStateTone(identity?.state) === "pending" ? identity : null);
  const previousIds = history.filter((item) => item.id !== application?.id && getStateTone(item.state) !== "pending");
  const currentIdentity = identity && identity.id !== application?.id ? identity : history.find((item) => getStateTone(item.state) === "active") || identity;
  const visibleTokens = useMemo(() => tokens.filter((token) => {
    const details = tokenDetails(token);
    return `${details.name} ${details.issuer} ${details.state}`.toLowerCase().includes(search.trim().toLowerCase());
  }), [tokens, search]);
  const openIdentity = (id) => id && router.push(`/neuro-access/detailpage/${encodeURIComponent(id)}?tab=identity`);
  const openToken = (id) => id && router.push(`/neuro-assets/detailpage/${encodeURIComponent(id)}`);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#e4e7e9] p-4 text-[#182127] sm:p-6 lg:p-8 xl:p-10">
      <div className="grid min-h-[calc(100vh-144px)] w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
        <section className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(24,33,39,0.05)]">
          <div className="p-6 lg:p-8"><h1 className="text-base font-bold">My Digital ID</h1>
            {loading ? <p className="mt-6 text-base text-[#7a8085]">Loading your digital ID…</p> : currentIdentity ? <><div className="mt-6 flex gap-5"><ProfilePhoto identity={currentIdentity} /><div className="min-w-0 flex-1"><p className="text-xs text-[#7a8085]">Digital ID</p><h2 className="mt-1 truncate text-lg font-semibold">{getIdentityDisplayName(currentIdentity)}</h2><div className="my-3 border-t border-[#e8eaec]" /><p className="text-xs text-[#7a8085]">ID created: {getDate(currentIdentity.created)}</p><p className="mt-2 text-xs text-[#7a8085]">Status:<StatusBadge state={currentIdentity.state} /></p></div></div><ManageButton onClick={() => setEditOpen(true)}>Manage ID</ManageButton></> : <p className="mt-6 text-base text-[#7a8085]">No digital ID is connected to this session.</p>}</div>
          <div className="border-t border-[#e8eaec] p-6 lg:p-8"><p className="text-xs text-[#7a8085]">ID application detected{application ? ":" : "."}</p>{application ? <div className="mt-3"><IdentitySummary identity={application} application onManage={() => openIdentity(application.id)} /></div> : <p className="mt-3 text-sm text-[#7a8085]">No ID application detected.</p>}</div>
          <div className="flex-1 border-t border-[#e8eaec] p-6 lg:p-8"><p className="text-xs text-[#7a8085]">{previousIds.length} previous ID{previousIds.length === 1 ? "" : "s"} detected{previousIds.length ? ":" : "."}</p>{previousIds.length ? <div className="mt-3 grid gap-4 md:grid-cols-2">{previousIds.map((item) => <IdentitySummary key={item.id} identity={item} onInfo={() => openIdentity(item.id)} />)}</div> : <p className="mt-3 text-sm text-[#7a8085]">No previous IDs detected.</p>}</div>
        </section>

        <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:p-8"><h2 className="text-base font-bold">My access tokens</h2><p className="mt-3 text-xs text-[#7a8085]">{tokens.length} access token{tokens.length === 1 ? "" : "s"} detected</p><label className="mt-4 flex h-11 items-center gap-3 rounded-md border border-[#dfe2e5] px-4 text-[#7a8085]"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#7a8085]" placeholder="Search" aria-label="Search access tokens" /></label><div className="mt-6 space-y-4">{loading ? <p className="text-base text-[#7a8085]">Loading access tokens…</p> : visibleTokens.length ? visibleTokens.map((token, index) => <AccessTokenCard key={tokenDetails(token).id || index} token={token} onManage={openToken} />) : <p className="text-base text-[#7a8085]">No access tokens found.</p>}</div></section>
      </div>
      {editOpen && currentIdentity && <DigitalIdentityModal identity={currentIdentity} previousIds={previousIds} onClose={() => setEditOpen(false)} />}
    </main>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  return searchParams.get("section") === "my-neuro" ? <DigitalIdentityPage /> : <AccessDashboard />;
}
