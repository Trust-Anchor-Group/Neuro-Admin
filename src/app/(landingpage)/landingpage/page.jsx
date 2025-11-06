'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  MdEmojiTransportation,
  MdAccountBalance,
  MdOutlineTimeline,
  MdOutlineSecurity,
  MdDocumentScanner,
  MdOutlineStorage,
  MdLockOutline,
} from 'react-icons/md';
import Navbar from '@/components/shared/Navbar';
import SessionPing from '@/components/SessionPing';
import AgentAPI from 'agent-api';

// --- TabID helpers (same logic as your QuickLogin component) ---
function CreateGUID() {
  function Segment() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  // AgentAPI library may dispatch window-level custom events as { detail: { type: 'QuickLoginApproved' | 'SignatureReceived' | 'SignatureReceivedBE', ... } }
  useEffect(() => {
    const handler = (evt) => {
      const detail = evt?.detail || {};
      const t = detail.type;
      if (!t) return;
      console.log('[AgentEvent]', t, detail);
      if (t === 'QuickLoginApproved' || t === 'SignatureReceived' || t === 'SignatureReceivedBE') {
        if (lastRemoteDomain) switchToRemote(lastRemoteDomain);
      }
    };
    window.addEventListener('AgentEvent', handler);
    return () => window.removeEventListener('AgentEvent', handler);
  }, [lastRemoteDomain]);

  return (
    Segment() +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    Segment() +
    Segment()
  );
}

let TabID;
try {
  if (typeof window !== 'undefined') {
    if (window.name && window.name.length === 36) TabID = window.name;
    else TabID = window.name = CreateGUID();
  } else {
    TabID = CreateGUID();
  }
} catch (e) {
  TabID = CreateGUID();
}

// SERVICES LIST
const services = [
  {
    title: 'Neuro-Access',
    description: 'Identity and access management',
    icon: MdOutlineSecurity,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-access',
    status: 'Active',
    locked: false,
  },
  {
    title: 'Neuro-Carbon',
    description: 'Climate compensation management',
    icon: MdDocumentScanner,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-carbon',
    status: 'Learn more',
    locked: true,
  },
  {
    title: 'Neuro-Monitor',
    description: 'Asset and process monitoring',
    icon: MdOutlineTimeline,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-exchange.com/pri/dashboard/',
    status: 'Learn more',
    locked: false,
    newTab: true,
  },
  {
    title: 'Neuro-Payments',
    description: 'Payment monitoring and management',
    icon: MdAccountBalance,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-admin.com/site/loginqr',
    status: 'Learn more',
    locked: false,
    newTab: true,
  },
  {
    title: 'Neuro-Leasing',
    description: 'Leasing management portal',
    icon: MdEmojiTransportation,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: 'Learn more',
    locked: true,
  },
  {
    title: 'Neuron management',
    description: 'Server management console',
    icon: MdOutlineStorage,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: 'Learn more',
    locked: true,
  },
];

// BRAND LOGO SELECTOR
const getBrandConfig = (host) => {
  const lowerHost = host?.toLowerCase() || '';
  if (lowerHost.includes('kikkin')) {
    return {
      logo: '/KikkinLogo.jpg',
      name: 'Kikkin Admin',
    };
  }
  return {
    logo: '/NeuroLogo.svg',
    name: 'Neuro Admin',
  };
};

export default function LandingPage() {
  const [host, setHost] = useState('');
  const [brand, setBrand] = useState({ logo: '/NeuroLogo.svg', name: 'Neuro Admin' });
  const [remoteOpen, setRemoteOpen] = useState(false);
  const [references, setReferences] = useState([]); // {domain, legalId}
  const [selectedDomain, setSelectedDomain] = useState('');
  const [localLegalId, setLocalLegalId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [lastRemoteDomain, setLastRemoteDomain] = useState('');
  const purpose = 'Admin Quick-Login via web';

  // --- Remote WS refs & lifecycle ---
  const remoteWsRef = useRef(null);
  const remotePingRef = useRef(null);

  useEffect(() => {
    const storedHost = sessionStorage.getItem('AgentAPI.Host');
    if (storedHost) {
      setHost(storedHost);
      setBrand(getBrandConfig(storedHost));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (remotePingRef.current) clearInterval(remotePingRef.current);
        remoteWsRef.current?.send?.(JSON.stringify({ cmd: 'Unregister' }));
        remoteWsRef.current?.close?.();
      } catch { }
    };
  }, []);

  // --- Remote WS connection ---
  const connectRemoteEvents = (remoteDomain) => {
    // close old
    try {
      if (remotePingRef.current) clearInterval(remotePingRef.current);
      if (remoteWsRef.current) {
        remoteWsRef.current.send?.(JSON.stringify({ cmd: 'Unregister' }));
        remoteWsRef.current.close?.();
      }
    } catch { }

    const wsUrl = `wss://${remoteDomain}/ClientEventsWS`;
    const socket = new WebSocket(wsUrl, ['ls']);
    remoteWsRef.current = socket;

    socket.onopen = () => {
      setStatusMsg(`Connected to remote events on ${remoteDomain}`);
      socket.send(
        JSON.stringify({
          cmd: 'Register',
          tabId: TabID,
          location: window.location.href,
        })
      );

      remotePingRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ cmd: 'Ping' }));
        }
      }, 10_000);
    };

    const remoteSignatureReceived = (signatureData, remoteDomain) => {
      if (!signatureData) return;
      try {
        // Mirror QuickLogin storage logic
        if (signatureData?.Properties && signatureData?.Attachments) {
          const userData = {
            name: `${signatureData.Properties.FIRST || ''} ${signatureData.Properties.LAST || ''}`.trim(),
            legalId: signatureData.Id,
            pictureId: signatureData.Attachments[0]?.Id,
          };
          sessionStorage.setItem('neuroUser', JSON.stringify(userData));
          sessionStorage.setItem('profile', JSON.stringify(signatureData));
        }
        sessionStorage.setItem('signatureReceived', JSON.stringify(signatureData));
        // Ensure host switch after data stored
        switchToRemote(remoteDomain);
        setStatusMsg('Remote quick login approved and profile stored.');
      } catch (e) {
        console.warn('Failed to persist remote signature data', e);
      }
    };

    socket.onmessage = (ev) => {
      if (!ev.data) return;
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (!msg?.type) return;

      console.log('[Remote WS] Event:', msg);
      const t = msg.type;
      if (t === 'SignatureReceived' || t === 'SignatureReceivedBE') {
        setStatusMsg('Remote signature received. Finalizing...');
        try { socket.send(JSON.stringify({ cmd: 'Unregister' })); } catch {}
        socket.close();
        remoteSignatureReceived(msg.data, remoteDomain);
      } else if (t === 'QuickLoginApproved' || t === 'QuickLoginGranted') {
        setStatusMsg('Remote login approved. Switching host…');
        try { socket.send(JSON.stringify({ cmd: 'Unregister' })); } catch {}
        socket.close();
        switchToRemote(remoteDomain);
      } else if (t === 'QuickLoginDenied' || t === 'QuickLoginRejected') {
        setStatusMsg('Remote login denied in app.');
      }
    };

    socket.onerror = () => {
      setStatusMsg(`[Remote WS] Error on ${remoteDomain}`);
    };

    socket.onclose = () => {
      if (remotePingRef.current) clearInterval(remotePingRef.current);
    };
  };

  const loadReferences = async () => {
    setStatusMsg('Loading remote references...');
    try {
      const r = await AgentAPI.Account.RemoteReferences();
      setReferences(r?.References || []);
      setStatusMsg(`Loaded ${(r?.References || []).length} references`);
    } catch (e) {
      setStatusMsg('Failed to load references');
    }
  };

  // Return the id so triggerRemote can use it immediately
  const prepareRemote = async () => {
    setStatusMsg('Preparing local quick login...');
    try {
      const r = await AgentAPI.Account.PrepareRemoteQuickLogin();
      const id = r?.legalId || r?.LegalId || r?.Id || '';
      setLocalLegalId(id);
      setStatusMsg(id ? 'Local legalId ready' : 'No legalId returned');
      return id;
    } catch (e) {
      setStatusMsg('Prepare failed');
      return '';
    }
  };

  const switchToRemote = (domain) => {
    if (!domain) return;
    try {
      AgentAPI.IO?.SetHost?.(domain, true);
    } catch { }
    sessionStorage.setItem('AgentAPI.Host', domain);
    setHost(domain);
    setBrand(getBrandConfig(domain));
    setLastRemoteDomain(domain);
    setStatusMsg(`Switched to remote neuron: ${domain}`);
    // After switching, you can optionally close the remote WS
    // try {
    //   if (remotePingRef.current) clearInterval(remotePingRef.current);
    //   remoteWsRef.current?.send?.(JSON.stringify({ cmd: 'Unregister' }));
    //   remoteWsRef.current?.close?.();
    // } catch { }
  };

  const triggerRemote = async () => {
    const domain = selectedDomain || 'lab.tagroot.io';
    setLastRemoteDomain(domain);

    // Ensure we are listening for the remote event BEFORE triggering
    connectRemoteEvents(domain);

    // Ensure we have a legalId right now (don't rely on async state)
    let id = localLegalId;
    if (!id) {
      id = await prepareRemote();
      if (!id) return; // abort if still missing
    }

    setStatusMsg('Triggering remote quick login...');
    try {
      const r = await AgentAPI.Account.RemoteQuickLogin(domain, id, purpose);
      if (r?.loggedIn) {
        setStatusMsg('Already logged in on remote. Switching host…');
        switchToRemote(domain);
      } else if (r?.petitionSent) {
        switchToRemote(domain);
        setStatusMsg('Petition sent. Await approval in app…');
        // WS will catch the approval event and switch host
      } else {
        setStatusMsg('Remote cannot quick-login (no identity or broker lacks Legal Identity)');
      }
    } catch (e) {
      setStatusMsg('Trigger failed');
    }
  };

  return (
    <>
      <SessionPing />
      <div className="relative min-h-screen w-full bg-[#F5F6F7] font-sans overflow-x-hidden">
        <Navbar neuroLogo={true} />
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 bg-[url('/backgroundSvg.svg')] bg-no-repeat bg-cover bg-center opacity-100 filter contrast-[0.6] brightness-[1]" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-14 pb-24">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-[24px] font-bold text-gray-900">
                Welcome to <span className="font-semibold">{brand.name}</span>
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">Please select where you would like to enter</p>
            </div>
          </div>

          {/* Simple Remote Quick Login Panel */}
          {/* <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => setRemoteOpen((o) => !o)}
              className="text-xs mb-3 px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100"
            >
              {remoteOpen ? 'Hide Remote Quick Login' : 'Show Remote Quick Login'}
            </button>
            {remoteOpen && (
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={loadReferences} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300">
                    Load References
                  </button>
                  <button onClick={prepareRemote} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300">
                    Prepare
                  </button>
                  <button onClick={triggerRemote} className="px-3 py-1.5 rounded bg-[#8B5CF6] text-white hover:bg-[#7a3fd1]">
                    Trigger
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">Select Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                  >
                    <option value="">-- choose --</option>
                    {references.map((r) => (
                      <option key={r.domain} value={r.domain}>
                        {r.domain}
                      </option>
                    ))}
                  </select>
                </div>
                {localLegalId && (
                  <p className="text-[11px] text-gray-500">
                    Local legalId: <span className="font-mono">{localLegalId}</span>
                  </p>
                )}
                {statusMsg && <p className="text-[11px] text-gray-600">{statusMsg}</p>}
              </div>
            )}
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-[48px] items-start">
            {/* LEFT SECTION */}
            <div className="flex flex-col gap-[24px]">
              {/* EcoTech Card */}
              <div className="rounded-[16px] bg-[var(--brand-secondary)] shadow-[0px_4px_10px_rgba(24,31,37,0.05)] px-[24px] py-[20px] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center bg-[var(--brand-background)]">
                    <img
                      src={brand.logo}
                      alt="Client Logo"
                      className="w-[48px] h-[48px] object-contain rounded-full shadow-sm"
                    />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{host}</h2>
                    <p className="text-[14px] text-gray-500 mt-[4px]">Current Neuron</p>
                  </div>
                </div>
              </div>

              {/* Destination Card */}
              <div className="rounded-[16px] bg-[#DFE1E3] shadow-[inset_0_0_10px_rgba(24, 31, 37, 0.10)] px-[24px] py-[20px]">
                <label className="text-[14px] text-gray-700 font-medium block mb-2">Destination</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-[8px] cursor-pointer bg-white py-[12px] px-[16px] text-[16px] text-gray-900 font-medium focus:outline-none">
                    <option>Main - {host}</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center text-gray-600 text-sm pointer-events-none">▼</div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="relative">
              <div className="absolute top-[-60px] right-0 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                </svg>
                Manage services
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[32px]">
                {services.map((item, index) => (
                  <Link
                    key={index}
                    href={item.locked ? '#' : item.href}
                    target={!item.locked && /^https?:\/\//i.test(item.href) ? '_blank' : undefined}
                    rel={!item.locked && /^https?:\/\//i.test(item.href) ? 'noopener noreferrer' : undefined}
                    className={`group relative rounded-[16px] border border-gray-200 bg-white p-[24px] w-full h-[240px] flex flex-col justify-between transition duration-200 ${item.locked ? 'opacity-50 hover:opacity-100 ' : 'hover:shadow-md'
                      }`}
                  >
                    {item.title === 'Neuro-Monitor' && (
                      <div className="absolute top-0 right-0 overflow-hidden w-[150px] h-[150px]">
                        <div className="absolute -right-[40px] top-[20px] w-[150px] bg-[#8F40D4] text-white text-[12px] font-bold text-center transform rotate-45  shadow-md">
                          BETA
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      {item.locked ? (
                        <div className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-full bg-[#DFE1E3]">
                          <item.icon size={18} className="text-gray-700" />
                          <MdLockOutline size={16} className="text-gray-400" />
                        </div>
                      ) : (
                        <div className={`p-[10px] rounded-full ${item.iconBg}`}>
                          <item.icon size={20} className={item.iconColor} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className={`text-[16px] font-semibold ${item.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <div className="h-[1px] bg-gray-200 my-[6px] w-full" />
                      <p className={`text-[14px] leading-[1.4] ${item.locked ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>

                    <p className={`text-[12px] mt-4 ${item.locked ? 'text-gray-400' : 'text-gray-500'}`}>{item.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
