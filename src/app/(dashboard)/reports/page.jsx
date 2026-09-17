'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveAdminHost } from '@/lib/activeAdminHost';
import { getAgentApiHost, getNeuronSwitchClientSnapshot } from '@/lib/neuronSwitchClient';
import { executeReport, getReportParameters, getReports, hasAgentToken, inspectReportsTarget, subscribeExecutionEvidence } from '@/lib/reports/agentClient';
import { resolveReportsJid, validateReportsJid } from '@/lib/reports/configuration';
import ParameterForm from '@/components/reports/ParameterForm';
import ResultView from '@/components/reports/ResultView';

function statusLabel(state) {
  if (state === 'loading') return 'Loading reports...';
  if (state === 'ready') return 'Ready';
  if (state === 'running') return 'Running';
  if (state === 'completed') return 'Completed';
  if (state === 'error') return 'Error';
  return 'Not configured';
}

function requiredParameterError(parameters) {
  const missing = (parameters?.field || []).find((field) => {
    const required = field?.required === true || field?.required === 'true' || field?.required?.value === 'true';
    const value = Array.isArray(field?.value)
      ? field.value.map((item) => item?.value ?? '').join('').trim()
      : String(field?.value?.value ?? '').trim();
    return required && !value;
  });
  return missing ? { kind: 'unknown', message: `Required field missing: ${missing.label || missing.var}`, technical: `Complete the required field "${missing.var}" before executing the report.` } : null;
}

function ErrorPanel({ error, onRetry }) {
  if (!error) return null;
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">{error.message}</p>
      {error.kind === 'presence' ? <p className="mt-2 text-sm">The Reports target could not be resolved to a full JID. Ask the target Neuron administrator to approve Agent presence, then retry. No automatic approval was attempted.</p> : null}
      {error.kind === 'privileges' ? <p className="mt-2 text-sm">Review the authenticated Agent account&apos;s Reports privileges on the target Neuron.</p> : null}
      {error.kind === 'source-not-visible' ? <p className="mt-2 text-sm">The Agent account can reach this Neuron, but its Reports data source is not visible. Do not retry until the account access is corrected.</p> : null}
      {error.kind === 'source-lookup-failed' ? <p className="mt-2 text-sm">The Reports source was visible during pre-flight, but the Reports node lookup failed. This is different from authentication failure.</p> : null}
      {onRetry ? <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium">Retry</button> : null}
      <details className="mt-3 text-xs"><summary>Developer details</summary><pre className="mt-2 whitespace-pre-wrap">{error.technical || 'No technical detail returned.'}</pre>{error.details && Object.keys(error.details).length ? <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(error.details, null, 2)}</pre> : null}</details>
    </section>
  );
}

export default function ReportsPage() {
  const activeAdminHost = useActiveAdminHost();
  const [agentHomeHost, setAgentHomeHost] = useState('');
  const [agentTokenExists, setAgentTokenExists] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [parameters, setParameters] = useState(null);
  const [result, setResult] = useState(null);
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const [resolvedReportsJid, setResolvedReportsJid] = useState('');
  const [agentBareJid, setAgentBareJid] = useState('');
  const [dataSources, setDataSources] = useState([]);
  const [reportsSourceVisible, setReportsSourceVisible] = useState(null);
  const [executionEvidence, setExecutionEvidence] = useState(null);
  const executionGenerationRef = useRef(0);
  const executionInFlightRef = useRef(false);

  const configuredReportsJid = useMemo(() => resolveReportsJid(activeAdminHost), [activeAdminHost]);
  const configurationError = useMemo(() => validateReportsJid(configuredReportsJid), [configuredReportsJid]);
  const reportsRequestJid = resolvedReportsJid || configuredReportsJid;

  useEffect(() => {
    return subscribeExecutionEvidence(setExecutionEvidence);
  }, []);

  useEffect(() => {
    const snapshot = getNeuronSwitchClientSnapshot();
    setAgentHomeHost(getAgentApiHost() || snapshot.agentHost || '');
    setAgentTokenExists(Boolean(snapshot.sourceJwt) || hasAgentToken());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReports([]); setSelectedReport(''); setParameters(null); setResult(null); setError(null);
    setResolvedReportsJid(''); setAgentBareJid(''); setDataSources([]); setReportsSourceVisible(null);
    executionGenerationRef.current += 1;
    executionInFlightRef.current = false;
    setExecutionEvidence(null);
    setState(activeAdminHost && configuredReportsJid ? 'loading' : 'idle');
    if (!activeAdminHost || configurationError || !agentHomeHost || !agentTokenExists) return () => { cancelled = true; };

    async function discover() {
      try {
        const inspection = await inspectReportsTarget(agentHomeHost, configuredReportsJid);
        if (cancelled) return;
        setResolvedReportsJid(inspection.resolvedReportsJid); setAgentBareJid(inspection.agentBareJid); setDataSources(inspection.dataSources); setReportsSourceVisible(inspection.reportsSourceVisible);
        if (!inspection.reportsSourceVisible) {
          setError({ kind: 'source-not-visible', message: 'REPORTS ACCESS NOT AVAILABLE', technical: 'GetAllDataSources succeeded, but no data source with ID Reports was returned for this Agent account.', details: { presence: 'OK', targetReachable: 'OK', reportsSourceVisible: 'NO' } });
          setState('error');
          return;
        }
        const found = await getReports(agentHomeHost, inspection.reportsRequestJid, 'en', true);
        if (cancelled) return;
        setReports(Array.isArray(found) ? found.map((id) => String(id)) : []); setState('ready');
      } catch (caught) {
        if (!cancelled) {
          if (caught?.details?.resolvedReportsJid && caught.details.resolvedReportsJid !== 'Not resolved') setResolvedReportsJid(caught.details.resolvedReportsJid);
          setError(caught);
          setState('error');
        }
      }
    }
    discover();
    return () => { cancelled = true; };
  }, [activeAdminHost, configuredReportsJid, configurationError, agentHomeHost, agentTokenExists]);

  async function selectReport(reportId) {
    setSelectedReport(reportId); setParameters(null); setResult(null); setError(null); setState('loading');
    try { setParameters(await getReportParameters(agentHomeHost, reportsRequestJid, reportId)); setState('ready'); }
    catch (caught) { setError(caught); setState('error'); }
  }

  async function runReport() {
    if (!selectedReport || !parameters) return;
    if (executionInFlightRef.current) return;
    const validationError = requiredParameterError(parameters);
    if (validationError) { setError(validationError); setState('error'); return; }
    executionInFlightRef.current = true;
    const executionGeneration = ++executionGenerationRef.current;
    setError(null); setState('running');
    try {
      const nextResult = await executeReport(agentHomeHost, reportsRequestJid, selectedReport, parameters);
      if (executionGeneration === executionGenerationRef.current) {
        setResult(nextResult);
        setState('completed');
      }
    } catch (caught) {
      if (executionGeneration === executionGenerationRef.current) {
        setError(caught);
        setState('error');
      }
    } finally {
      if (executionGeneration === executionGenerationRef.current) executionInFlightRef.current = false;
    }
  }

  function retry() {
    setError(null); setReports([]); setState('loading');
    inspectReportsTarget(agentHomeHost, configuredReportsJid)
      .then(async (inspection) => {
        setResolvedReportsJid(inspection.resolvedReportsJid); setAgentBareJid(inspection.agentBareJid); setDataSources(inspection.dataSources); setReportsSourceVisible(inspection.reportsSourceVisible);
        if (!inspection.reportsSourceVisible) throw { kind: 'source-not-visible', message: 'REPORTS ACCESS NOT AVAILABLE', technical: 'GetAllDataSources succeeded, but no Reports source was returned.' };
        const found = await getReports(agentHomeHost, inspection.reportsRequestJid, 'en', true);
        setReports(Array.isArray(found) ? found.map((id) => String(id)) : []); setState('ready');
      })
      .catch((caught) => { setError(caught); setState('error'); });
  }

  const connection = !activeAdminHost || !agentHomeHost || !agentTokenExists ? 'Not configured' : configurationError ? 'Not configured' : error ? 'Error' : statusLabel(state);

  return (
    <main className="min-h-full bg-[var(--brand-background)] p-6 text-[var(--brand-text)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <header><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-text-secondary)]">Neuro Admin</p><h1 className="mt-1 text-3xl font-bold">Reports</h1><p className="mt-2 text-sm text-[var(--brand-text-secondary)]">Reports are requested through the stable Agent home while targeting the currently administered Neuron.</p></header>
        <section className="grid gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4 text-sm md:grid-cols-2 lg:grid-cols-5"><ContextValue label="Active Neuron" value={activeAdminHost || 'Loading...'} /><ContextValue label="Agent connection" value={agentHomeHost || 'Not authenticated'} /><ContextValue label="Reports target" value={configuredReportsJid || 'Not configured'} /><ContextValue label="Connection" value={connection} /><ContextValue label="Agent token" value={agentTokenExists ? 'Present (hidden)' : 'Missing'} /></section>
        {!activeAdminHost ? <Notice>Waiting for the active Admin Neuron.</Notice> : null}
        {activeAdminHost && configurationError ? <Notice>Reports are not configured for this Neuron. Configure its explicit Reports JID to enable discovery.</Notice> : null}
        {activeAdminHost && !agentHomeHost ? <Notice>The Agent home is not available. Complete the normal Neuro Admin login first.</Notice> : null}
        {activeAdminHost && agentHomeHost && !agentTokenExists ? <Notice>AGENT NOT AUTHENTICATED: the source Agent JWT is missing.</Notice> : null}
        <ErrorPanel error={error} onRetry={configuredReportsJid && agentHomeHost ? retry : null} />
        {configuredReportsJid && agentHomeHost && agentTokenExists && !error ? <div className="grid gap-6 lg:grid-cols-[300px_1fr]"><section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Available reports</h2><span className="text-xs text-[var(--brand-text-secondary)]">{state === 'loading' ? 'Loading...' : `${reports.length} found`}</span></div><div className="mt-4 space-y-2">{reports.map((reportId) => <button key={reportId} type="button" onClick={() => selectReport(reportId)} disabled={state === 'running' || state === 'loading'} className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedReport === reportId ? 'border-[var(--brand-accent)] bg-[var(--brand-background)] font-semibold' : 'border-[var(--brand-border)]'}`}>{reportId}</button>)}</div>{state === 'ready' && reports.length === 0 ? <p className="mt-4 text-sm text-[var(--brand-text-secondary)]">No reports were returned for this target.</p> : null}</section><section className="space-y-5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5" aria-live="polite"><div><h2 className="text-xl font-semibold">{selectedReport || 'Select a report'}</h2><p className="mt-1 text-sm text-[var(--brand-text-secondary)]">{state === 'running' ? 'Waiting for report events from the Agent home...' : selectedReport ? 'Parameters are generated by the selected report.' : 'Choose a report to load its parameters.'}</p></div>{parameters ? <><ParameterForm parameters={parameters} onChange={setParameters} disabled={state === 'running'} /><button type="button" onClick={runReport} disabled={state === 'running'} className="rounded-lg bg-[var(--brand-button,#A160E8)] px-4 py-2 text-sm font-semibold text-white">{state === 'running' ? 'Running...' : 'Run report'}</button></> : null}{result ? <><ResultView result={result} /><details><summary className="cursor-pointer text-sm font-medium">Raw JSON</summary><pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-black/5 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre></details></> : null}</section></div> : null}
        <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4 text-sm"><summary className="cursor-pointer font-semibold">Developer evidence</summary><dl className="mt-4 grid gap-3 md:grid-cols-2"><ContextValue label="Agent API host" value={agentHomeHost || 'Not available'} /><ContextValue label="Events host" value={agentHomeHost || 'Not available (Events remains on the source host)'} /><ContextValue label="Agent/XMPP bare JID" value={agentBareJid || 'Not resolved'} /><ContextValue label="Configured Reports JID" value={configuredReportsJid || 'Not configured'} /><ContextValue label="Resolved Full JID" value={resolvedReportsJid || 'Not resolved'} /><ContextValue label="Reports source visible" value={reportsSourceVisible === true ? 'Yes' : reportsSourceVisible === false ? 'No' : 'Not checked'} /><ContextValue label="Available data sources" value={dataSources.length ? dataSources.map((source) => source.id || source.name).join(', ') : 'None returned'} /><ContextValue label="Last report state" value={statusLabel(state)} /></dl>{executionEvidence ? <><h3 className="mt-5 font-semibold">Execution lifecycle</h3><p className="mt-1 text-xs text-[var(--brand-text-secondary)]">Sanitized client evidence; credentials and tokens are never included.</p><dl className="mt-3 grid gap-3 md:grid-cols-2"><ContextValue label="Execution ID" value={executionEvidence.executionId || 'Not available'} /><ContextValue label="Report" value={executionEvidence.report || 'Not available'} /><ContextValue label="Global TabID" value={executionEvidence.tabId || 'Not captured'} /><ContextValue label="Query ID" value={executionEvidence.queryId || 'Not created'} /><ContextValue label="Registry key" value={executionEvidence.registryKey || 'Not created'} /><ContextValue label="Registry entry present" value={executionEvidence.registryPresent ? 'Yes' : 'No'} /><ContextValue label="Started" value={executionEvidence.startedAt || 'Not available'} /><ContextValue label="Events URL" value={executionEvidence.eventsUrl || 'Not captured'} /><ContextValue label="Events state" value={executionEvidence.eventsState} /><ContextValue label="Events generation" value={String(executionEvidence.eventsGeneration)} /><ContextValue label="Events reconnect count" value={String(executionEvidence.eventsReconnectCount)} /><ContextValue label="Events close count" value={String(executionEvidence.eventsCloseCount)} /><ContextValue label="Events register count" value={String(executionEvidence.eventsRegisterCount)} /><ContextValue label="Events opened" value={executionEvidence.eventsOpenedAt || 'Not opened'} /><ContextValue label="Events last close" value={executionEvidence.eventsLastCloseAt || 'None'} /><ContextValue label="Events registered tab ID" value={executionEvidence.eventsRegisteredTabId || 'Not captured'} /><ContextValue label="Events last message" value={executionEvidence.eventsLastMessageAt || 'None received'} /><ContextValue label="Messages after execution start" value={String(executionEvidence.eventsMessagesAfterStart)} /><ContextValue label="Last post-start message" value={executionEvidence.eventsLastMessageAfterStartAt || 'None'} /><ContextValue label="Events last message type" value={executionEvidence.eventsLastMessageType || 'None received'} /><ContextValue label="Events message query ID" value={executionEvidence.eventsLastMessageQueryId || 'None received'} /><ContextValue label="RegisterEventHandler" value={executionEvidence.registerEventHandler} /><ContextValue label="Registration HTTP status" value={executionEvidence.registerEventHandlerHttpStatus === null ? 'Not captured' : String(executionEvidence.registerEventHandlerHttpStatus)} /><ContextValue label="Registration response" value={executionEvidence.registerEventHandlerResponseShape || 'Not captured'} /><ContextValue label="Registered localName" value={executionEvidence.registerEventHandlerLocalName || 'Not captured'} /><ContextValue label="Registered namespace" value={executionEvidence.registerEventHandlerNamespace || 'Not captured'} /><ContextValue label="Registered type" value={executionEvidence.registerEventHandlerType || '(empty)'} /><ContextValue label="Registered function" value={executionEvidence.registerEventHandlerFunction || 'Not captured'} /><ContextValue label="Register tab ID" value={executionEvidence.registerEventHandlerTabId || 'Not captured'} /><ContextValue label="Registration mode" value={executionEvidence.handlerRegistrationMode} /><ContextValue label="Handler cached before this run" value={executionEvidence.handlerWasCachedBeforeExecution === null ? 'Unknown' : executionEvidence.handlerWasCachedBeforeExecution ? 'Yes' : 'No'} /><ContextValue label="Registration started" value={executionEvidence.handlerRegistrationStartedAt || 'Not called this execution'} /><ContextValue label="Registration completed" value={executionEvidence.handlerRegistrationCompletedAt || 'Not called this execution'} /><ContextValue label="Execute request started" value={executionEvidence.executeRequestStartedAt || 'Not started'} /><ContextValue label="Execute request completed" value={executionEvidence.executeRequestCompletedAt || 'Not completed'} /><ContextValue label="Registration completed before execute" value={executionEvidence.registrationCompletedBeforeExecuteRequest === null ? 'Not applicable' : executionEvidence.registrationCompletedBeforeExecuteRequest ? 'Yes' : 'No'} /><ContextValue label="Execute query request" value={executionEvidence.executeQueryRequest} /><ContextValue label="Last queryProgress" value={executionEvidence.lastQueryProgressAt || 'None received'} /><ContextValue label="Progress event count" value={String(executionEvidence.progressEventCount)} /><ContextValue label="Last event state" value={executionEvidence.lastEventState || 'None received'} /><ContextValue label="Terminal event received" value={executionEvidence.terminalEventReceived ? 'Yes' : 'No'} /><ContextValue label="Result received" value={executionEvidence.resultReceived ? 'Yes' : 'No'} /><ContextValue label="Current UI state" value={executionEvidence.currentUiState} /><ContextValue label="Stale event count" value={String(executionEvidence.staleEventCount)} />{executionEvidence.error ? <ContextValue label="Lifecycle error" value={executionEvidence.error} /> : null}</dl><details className="mt-4"><summary className="cursor-pointer text-xs font-medium">Raw lifecycle JSON</summary><pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-black/5 p-3 text-xs">{JSON.stringify(executionEvidence, null, 2)}</pre></details></> : null}</details>
      </div>
    </main>
  );
}

function ContextValue({ label, value }) { return <div><dt className="text-xs text-[var(--brand-text-secondary)]">{label}</dt><dd className="mt-1 break-all font-medium">{value}</dd></div>; }
function Notice({ children }) { return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{children}</div>; }
