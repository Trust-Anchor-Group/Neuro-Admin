'use client';

import { useEffect, useState } from 'react';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import APIKeyQR from './APIKeyQR';
import { useLanguage, content } from '../../../../context/LanguageContext';

export default function APIKeyDetailsPanel({ apiKey }) {
  const [apiKeyDetails, setApiKeyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState({ apiKey: false, secretKey: false });
  const { language } = useLanguage();
  const t = content?.[language]?.apiKeyDetails || {};

  useEffect(() => {
    async function fetchAPIKeyDetails() {
      if (!apiKey) return;
      setLoading(true);
      try {
        const response = await fetch('/api/settings/api-keys/api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });

        if (!response.ok) throw new Error('Failed to fetch API key details');
        const data = await response.json();
        setApiKeyDetails(data.data);
      } catch (error) {
        console.error('Error fetching API key details:', error);
        setApiKeyDetails(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAPIKeyDetails();
  }, [apiKey]);

  if (loading) return <p className="py-10 text-center text-gray-500">{t.loading || 'Loading...'}</p>;
  if (!apiKeyDetails) return <p className="py-10 text-center text-red-500">{t.notFound || 'API Key not found'}</p>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6">
        <KeyInfo label={t.labels?.owner || 'Owner:'} value={apiKeyDetails.owner} isLink />
        <KeyInfo label={t.labels?.email || 'Email:'} value={apiKeyDetails.eMail} />
        <KeyInfo label={t.labels?.apiKey || 'API key:'} value={apiKeyDetails.key} secret visible={visibleKeys.apiKey} onToggle={() => setVisibleKeys((current) => ({ ...current, apiKey: !current.apiKey }))} />
        <KeyInfo label={t.labels?.secretKey || 'Secret key:'} value={apiKeyDetails.secret} secret visible={visibleKeys.secretKey} onToggle={() => setVisibleKeys((current) => ({ ...current, secretKey: !current.secretKey }))} />
        <KeyInfo label={t.labels?.created || 'Created:'} value={apiKeyDetails.created ? new Date(apiKeyDetails.created * 1000).toISOString().split('T')[0] : '-'} />
        <KeyInfo label={t.labels?.maxAccounts || 'Max no. accounts:'} value={apiKeyDetails.maxAccounts} />
        <KeyInfo label={t.labels?.accountsCreated || 'Accounts created:'} value={apiKeyDetails.nrCreated} />
        <KeyInfo label={t.labels?.accountsDeleted || 'Accounts deleted:'} value={apiKeyDetails.nrDeleted} />
      </div>
      <APIKeyQR apiKey={apiKeyDetails.key} />
    </div>
  );
}

function KeyInfo({ label, value, isLink = false, secret = false, visible, onToggle }) {
  return (
    <div className="border-b border-[var(--brand-border)] pb-3">
      <p className="mb-1 text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
      <div className="flex items-center justify-between">
        {secret ? (
          <div className="flex items-center gap-2 overflow-hidden font-mono text-sm text-[var(--brand-text-color)]">
            <span className="max-w-[400px] overflow-x-auto whitespace-nowrap pr-1">{visible ? value : '**********************'}</span>
            <button type="button" onClick={onToggle} className="text-gray-500 hover:text-gray-700" aria-label={`Show or hide ${label}`}>
              {visible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
            <button type="button" onClick={() => navigator.clipboard.writeText(value || '')} className="text-gray-500 hover:text-gray-700" aria-label={`Copy ${label}`}>
              <FaCopy size={14} />
            </button>
          </div>
        ) : (
          <div className="text-sm text-[var(--brand-text-color)]">{isLink ? <a href="#" className="text-neuroPurple hover:underline">{value}</a> : value}</div>
        )}
      </div>
    </div>
  );
}
