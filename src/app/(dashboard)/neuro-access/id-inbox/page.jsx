'use client';

import { useCallback, useEffect, useState } from 'react';

function elapsed(iso) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function time(iso) { return iso ? new Date(iso).toLocaleString() : '—'; }

export default function IdInboxPage() {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [discovery, setDiscovery] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/id-applications', { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 403 ? 'You do not have access to this inbox.' : 'Inbox is unavailable.');
      setData(await response.json());
      setError('');
    } catch (caught) { setError(caught.message); }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let cancelled = false;
    const load = async () => {
      const response = await fetch(`/api/id-applications/${selectedId}`, { cache: 'no-store' });
      if (response.ok && !cancelled) setDetail((await response.json()).alert);
    };
    load();
    const timer = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [selectedId]);

  const act = async (action) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/id-applications/${selectedId}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Action failed');
      setDetail(body.alert);
      await refresh();
      setError('');
    } catch (caught) { setError(caught.message); await refresh(); }
    finally { setBusy(false); }
  };

  const loadDiscovery = async () => {
    const response = await fetch('/api/id-applications/discovery', { cache: 'no-store' });
    if (response.ok) setDiscovery((await response.json()).events);
    else setError('Discovery access is restricted to configured debug operators.');
  };

  const alerts = data?.alerts || [];
  const today = new Date().toDateString();
  const counts = {
    new: alerts.filter((item) => item.status === 'new').length,
    acknowledged: alerts.filter((item) => item.status === 'acknowledged').length,
    handled: alerts.filter((item) => item.status === 'handled' && new Date(item.handledAt).toDateString() === today).length,
  };

  return <main data-hj-suppress data-cs-mask data-sentry-block className="p-8 text-[var(--brand-text)]">
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div><h1 className="text-3xl font-bold">ID Applications</h1><p className="mt-1 text-sm">Alerts from configured ID Neurons. The existing Neuro Admin process handles approval.</p></div>
      <button className="border rounded px-3 py-2" onClick={loadDiscovery}>Event discovery</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded bg-red-100 text-red-900 p-3">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
      {[['NEW', counts.new], ['ACKNOWLEDGED', counts.acknowledged], ['HANDLED TODAY', counts.handled]].map(([label, count]) =>
        <div key={label} className="rounded border bg-white p-4 text-gray-900"><div className="text-sm">{label}</div><div className="text-3xl font-bold">{count}</div></div>)}
    </div>
    {data?.neurons && <details className="mb-5"><summary>Configured Neurons</summary><ul className="mt-2 text-sm">{data.neurons.map((neuron) => <li key={neuron.id}>{neuron.name} · {neuron.jid} · {neuron.enabled ? 'Enabled' : 'Disabled'} · Last seen {time(neuron.lastSeenAt)}</li>)}</ul></details>}
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)] gap-5">
      <section className="rounded border bg-white text-gray-900 overflow-x-auto">
        <table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr><th className="p-3">Received</th><th className="p-3">Customer</th><th className="p-3">Neuron</th><th className="p-3">Reference</th><th className="p-3">Status</th></tr></thead>
          <tbody>{alerts.map((alert) => <tr key={alert.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedId(alert.id)}>
            <td className="p-3 whitespace-nowrap">{time(alert.receivedAt)}</td><td className="p-3">{alert.customerId || '—'}</td><td className="p-3">{alert.sourceNeuronName}</td><td className="p-3">{alert.applicationRef || alert.legalIdentityRef || '—'}</td><td className="p-3 font-semibold uppercase">{alert.status}</td>
          </tr>)}</tbody></table>
        {!alerts.length && <p className="p-4">No matching application alerts yet.</p>}
      </section>
      <section className="rounded border bg-white text-gray-900 p-5 min-h-64">
        {!detail ? <p>Select an alert to see its details.</p> : <>
          <h2 className="text-xl font-semibold">{detail.sourceNeuronName}</h2>
          <dl className="mt-4 grid grid-cols-[9rem_1fr] gap-2 text-sm">
            <dt>Customer</dt><dd>{detail.customerId || '—'}</dd><dt>Source JID</dt><dd className="break-all">{detail.sourceJid}</dd>
            <dt>Received</dt><dd>{time(detail.receivedAt)}</dd><dt>Waiting</dt><dd>{elapsed(detail.receivedAt)}</dd>
            <dt>EventId</dt><dd>{detail.eventId}</dd><dt>Application</dt><dd>{detail.applicationRef || '—'}</dd><dt>Legal identity</dt><dd>{detail.legalIdentityRef || '—'}</dd>
            <dt>Status</dt><dd className="uppercase">{detail.status}</dd><dt>Claimed by</dt><dd>{detail.claimedBy || detail.acknowledgedBy || '—'}</dd><dt>Claimed at</dt><dd>{time(detail.claimedAt || detail.acknowledgedAt)}</dd>
            <dt>Handled by</dt><dd>{detail.handledBy || '—'}</dd><dt>Handled at</dt><dd>{time(detail.handledAt)}</dd>
          </dl>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm">{detail.message}</p>
          <dl className="mt-4 text-sm space-y-2">
            {Object.entries(detail.notifications || {}).map(([channel, job]) => <div key={channel}>
              <dt className="font-semibold capitalize">{job.channel || channel}{job.recipientLabel && ` ${job.recipientLabel}`}</dt>
              <dd>{job.state.replaceAll('_', ' ')} · Attempts: {job.attempts}
                {job.lastError && <span> · {job.lastError}</span>}
                {job.nextAttemptAt && <span> · Next attempt: {time(job.nextAttemptAt)}</span>}
                {job.deliveredAt && <span> · Delivered: {time(job.deliveredAt)}</span>}
              </dd>
            </div>)}
          </dl>
          <div className="flex gap-2 mt-5">
            {detail.status === 'new' && <button disabled={busy} className="rounded bg-purple-700 text-white px-4 py-2 disabled:opacity-50" onClick={() => act('acknowledge')}>I&apos;m handling this</button>}
            {detail.status === 'acknowledged' && detail.acknowledgedBy === data?.operatorId && <button disabled={busy} className="rounded bg-green-700 text-white px-4 py-2 disabled:opacity-50" onClick={() => act('handle')}>Mark handled</button>}
          </div>
          {!!detail.auditTrail?.length && <details className="mt-5"><summary>Action history</summary><ul className="mt-2 text-sm">{detail.auditTrail.map((entry, index) => <li key={`${entry.at}-${index}`}>{entry.action} · {entry.operatorId} · {time(entry.at)}</li>)}</ul></details>}
        </>}
      </section>
    </div>
    {discovery && <section className="mt-6 rounded border bg-white p-5 text-gray-900"><h2 className="text-xl font-semibold">Recent discovery events</h2><p className="text-sm mb-3">Restricted troubleshooting data. Records are available for up to 24 hours.</p>
      {discovery.map((event) => <details key={event.rowKey} className="border-t py-3"><summary>{event.timestamp} · {event.sourceNeuronId} · {event.eventId || '(no EventId)'}</summary><pre className="overflow-auto whitespace-pre-wrap break-all text-xs bg-gray-100 p-3">{JSON.stringify(event, null, 2)}</pre></details>)}
    </section>}
  </main>;
}
