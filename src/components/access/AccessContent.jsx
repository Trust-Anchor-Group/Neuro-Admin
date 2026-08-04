'use client'
import { PaginatedList } from '@/components/access/PaginatedList'
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { userColoumnsAccount,customCellAcountTable } from './accountTableList.js'
import {userColoumnsPending,customCellPendingTable,pendingActions} from './pendingTable.js'
import { Modal } from '../shared/Modal.jsx';
import { pendingAction } from './pendingFetch.js';
import { getModalText } from '@/utils/getModalText.js';
import { useLanguage, content } from '../../../context/LanguageContext'


// Max items used when limit=all
const MAX_ITEMS = 1000000;
const MOCK_RECOVERY_APPLICATION = {
  id: 'mock-account-recovery-application',
  name: 'Alex Morgan',
  account: 'alex.morgan@example.com',
  other: { EMAIL: 'alex.morgan@example.com' },
  city: 'Stockholm',
  createdDate: '2026-08-03 10:30',
  isMockRecoveryApplication: true,
  properties: {
    REASON: 'Lost access to the Neuro Access app',
  },
};
const MOCK_POTENTIAL_MATCHES = [
  { id: 'alex.morgan@example.com', name: 'Alex Morgan', email: 'alex.morgan@example.com', phone: '+46 70 123 45 67', city: 'Stockholm', created: '2025-02-23, 15:18', digitalId: 'Alex Morgan', registered: 'se.id.tagroot.io', tokens: '5', contracts: '10', identities: '3' },
  { id: 'alex.morgan@neuro.example', name: 'Alex Morgan', email: 'alex.morgan@neuro.example', phone: '+46 73 456 78 90', city: 'Gothenburg', created: '2025-01-14, 09:42', digitalId: 'A. Morgan', registered: 'se.id.tagroot.io', tokens: '2', contracts: '4', identities: '1' },
];

function MockRecoveryPanel({ onClose }) {
  const [selectedAttachment, setSelectedAttachment] = useState('Profile photo');
  const [isDenialFormOpen, setIsDenialFormOpen] = useState(false);
  const [denialReason, setDenialReason] = useState('');
  const [checkedItems, setCheckedItems] = useState({ identity: false, selfie: false, differentPhotos: false, recovery: false });
  const [isPotentialMatchesOpen, setIsPotentialMatchesOpen] = useState(false);
  const [isVerificationLocked, setIsVerificationLocked] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reinstatementConfirmed, setReinstatementConfirmed] = useState(false);
  const attachments = [
    { name: 'Profile photo', left: '5.24%', top: '6.57%' },
    { name: 'Identity document, front', left: '26.21%', top: '6.57%' },
    { name: 'Identity document, back', left: '47.18%', top: '6.57%' },
    { name: 'Selfie', left: '68.15%', top: '6.57%' },
    { name: 'Proof of address', left: '5.24%', top: '14.33%' },
    { name: 'Recovery code', left: '26.21%', top: '14.33%' },
  ];
  const toggleCheck = (key) => setCheckedItems((current) => ({ ...current, [key]: !current[key] }));
  const hasVerification = Object.values(checkedItems).some(Boolean);
  const hasCompletedVerification = Object.values(checkedItems).every(Boolean);
  const selectedMatch = MOCK_POTENTIAL_MATCHES.find((account) => account.id === selectedAccount);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101418]/75 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex h-[calc(100vh-2rem)] w-full items-center justify-center gap-4 overflow-hidden">
      <section className="h-full shrink-0 overflow-y-auto rounded-[8px] shadow-2xl" style={{ width: 'min(496px, calc((100vw - 3rem) / 2))' }} role="dialog" aria-modal="true" aria-label="Account recovery application">
        <div className="bg-white text-[#181f25]">
          <div className="relative aspect-[496/1340] w-full overflow-hidden">
            <img src="/account-recovery-panel.svg" alt="Account recovery application details" className="block h-auto w-full" />
            {attachments.map((attachment) => (
              <button
                key={attachment.name}
                type="button"
                onClick={() => setSelectedAttachment(attachment.name)}
                className={`absolute h-[7.46%] w-[20.16%] rounded-[8px] ${selectedAttachment === attachment.name ? 'ring-2 ring-[#8f40d4] ring-offset-2' : ''}`}
                style={{ left: attachment.left, top: attachment.top }}
                aria-label={`Preview ${attachment.name}`}
              />
            ))}
            <div className="pointer-events-none absolute left-[5.24%] top-[22.39%] flex h-[20.82%] w-[89.52%] items-end p-3">
              <span className="rounded bg-white/90 px-2 py-1 text-xs font-semibold text-[#181f25] shadow-sm">{selectedAttachment}</span>
            </div>
          </div>
          <div className="px-6 pb-5">
            <h2 className="mb-4 text-sm font-bold">Reviewer verification</h2>
            <p className="mb-2 text-[11px] text-[#71787d]">Recovery request:</p>
            <fieldset className="space-y-1 border-0 p-0" aria-label="Recovery request verification">
              <label className={`flex min-h-9 items-center gap-3 px-3 text-[11px] font-medium leading-[14px] ${isVerificationLocked ? 'cursor-default bg-[#dfe2e4] text-[#71787d]' : checkedItems.identity ? 'cursor-pointer bg-[#f0ddff]' : 'cursor-pointer bg-[#f5f6f7]'}`}>
                <input type="checkbox" checked={checkedItems.identity} disabled={isVerificationLocked} onChange={() => toggleCheck('identity')} className={`h-4 w-4 shrink-0 ${isVerificationLocked ? 'accent-[#858b90]' : 'accent-[#8f40d4]'}`} />
                ID document in the recovery request is authentic and not expired
              </label>
              <label className={`flex min-h-9 items-center gap-3 px-3 text-[11px] font-medium leading-[14px] ${isVerificationLocked ? 'cursor-default bg-[#dfe2e4] text-[#71787d]' : checkedItems.selfie ? 'cursor-pointer bg-[#f0ddff]' : 'cursor-pointer bg-[#f5f6f7]'}`}>
                <input type="checkbox" checked={checkedItems.selfie} disabled={isVerificationLocked} onChange={() => toggleCheck('selfie')} className={`h-4 w-4 shrink-0 ${isVerificationLocked ? 'accent-[#858b90]' : 'accent-[#8f40d4]'}`} />
                Selfie matches the photo on the ID document
              </label>
              <label className={`flex min-h-9 items-center gap-3 px-3 text-[11px] font-medium leading-[14px] ${isVerificationLocked ? 'cursor-default bg-[#dfe2e4] text-[#71787d]' : checkedItems.differentPhotos ? 'cursor-pointer bg-[#f0ddff]' : 'cursor-pointer bg-[#f5f6f7]'}`}>
                <input type="checkbox" checked={checkedItems.differentPhotos} disabled={isVerificationLocked} onChange={() => toggleCheck('differentPhotos')} className={`h-4 w-4 shrink-0 ${isVerificationLocked ? 'accent-[#858b90]' : 'accent-[#8f40d4]'}`} />
                The selfie and the ID document photo are not using the same photo
              </label>
              <label className={`flex min-h-9 items-center gap-3 px-3 text-[11px] font-medium leading-[14px] ${isVerificationLocked ? 'cursor-default bg-[#dfe2e4] text-[#71787d]' : checkedItems.recovery ? 'cursor-pointer bg-[#f0ddff]' : 'cursor-pointer bg-[#f5f6f7]'}`}>
                <input type="checkbox" checked={checkedItems.recovery} disabled={isVerificationLocked} onChange={() => toggleCheck('recovery')} className={`h-4 w-4 shrink-0 ${isVerificationLocked ? 'accent-[#858b90]' : 'accent-[#8f40d4]'}`} />
                All recovery information matches the ID document
              </label>
            </fieldset>
            <p className="mt-3 text-[11px] leading-[14px] text-[#858b90]">Ensure the recovery application is valid before moving on to potential matches.</p>
            <div className={`mt-4 grid gap-2 ${isVerificationLocked ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {isVerificationLocked ? (
                <button type="button" onClick={() => { setIsVerificationLocked(false); setIsPotentialMatchesOpen(false); }} className="h-9 rounded-[8px] bg-[#dfe2e4] text-[11px] font-semibold text-[#71787d]">Change verification result</button>
              ) : <>
              <button type="button" onClick={() => setIsDenialFormOpen(true)} disabled={!hasVerification} className={`h-9 rounded-[8px] text-[11px] font-semibold ${hasVerification ? 'bg-[#f9dce1] text-[#c64d63]' : 'bg-[#dfe2e4] text-[#858b90]'}`}>Deny application</button>
              <button
                type="button"
                disabled={!hasCompletedVerification}
                onClick={() => { setIsVerificationLocked(true); setIsPotentialMatchesOpen(true); }}
                className={`h-9 rounded-[8px] text-[11px] font-semibold ${hasCompletedVerification ? 'text-white' : 'bg-[#dfe2e4] text-[#858b90]'}`}
                style={hasCompletedVerification ? { background: 'var(--Button-Neuro-Primary-bg, #8F40D4)' } : undefined}
              >
                Find account <span aria-hidden="true">→</span>
              </button>
              </>}
            </div>
            {isDenialFormOpen && (
              <div className="mt-4">
                <label htmlFor="denial-reason" className="mb-2 block text-[11px] text-[#71787d]">Reason for denial (required)</label>
                <textarea id="denial-reason" value={denialReason} onChange={(event) => setDenialReason(event.target.value)} placeholder="Message here" className="h-20 w-full resize-none rounded-[8px] border border-[#dfe2e4] bg-[#f7f8f9] p-3 text-sm outline-none placeholder:text-[#858b90] focus:border-[#8f40d4]" />
                <p className="mt-1 text-[11px] text-[#858b90]">This message will be sent to the user</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIsDenialFormOpen(false)} className="h-9 rounded-[8px] bg-[#f5f6f7] text-[11px] font-semibold">Back</button>
                  <button type="button" disabled={!denialReason.trim()} className={`h-9 rounded-[8px] text-[11px] font-semibold ${denialReason.trim() ? 'bg-[#f7475c] text-white' : 'bg-[#dfe2e4] text-[#858b90]'}`}>Deny application</button>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onClose} className="h-8 min-w-28 rounded-[8px] bg-[#f5f6f7] px-5 text-[11px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      </section>
      {isPotentialMatchesOpen && (
        <aside className="max-h-full shrink-0 self-start overflow-y-auto rounded-[8px] bg-white p-4 text-[#181f25] shadow-2xl" style={{ width: 'min(496px, calc((100vw - 3rem) / 2))' }} aria-label="Potential matches">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Potential matches</h2>
            <button type="button" onClick={() => setIsPotentialMatchesOpen(false)} className="text-lg leading-none text-[#71787d]" aria-label="Close potential matches">×</button>
          </div>
          <label htmlFor="potential-match-account" className="mb-2 block text-[11px] font-medium text-[#71787d]">Choose account ({MOCK_POTENTIAL_MATCHES.length} matches detected)</label>
          <select
            id="potential-match-account"
            value={selectedAccount}
            onChange={(event) => setSelectedAccount(event.target.value)}
            className="h-10 w-full rounded-[8px] border border-[#dfe2e4] bg-white px-3 text-xs font-medium outline-none focus:border-[#8f40d4]"
          >
            <option value="" disabled>Choose account</option>
            {MOCK_POTENTIAL_MATCHES.map((account) => (
              <option key={account.id} value={account.id}>{account.name} — {account.email}</option>
            ))}
          </select>
          {selectedMatch && (
            <div className="mt-5 space-y-4">
              <div className="border-b border-[#e7e9eb] pb-3">
                <p className="text-[10px] text-[#858b90]">Account name</p>
                <p className="text-sm font-bold">{selectedMatch.id}</p>
                <p className="mt-2 text-[10px] text-[#858b90]">Registered at {selectedMatch.registered}</p>
                <p className="mt-1 text-[10px] text-[#858b90]">Status: <span className="ml-1 rounded bg-[#d8eeeb] px-2 py-0.5 font-semibold text-[#24766d]">Active</span></p>
              </div>

              <section className="rounded-[10px] bg-[#f5f6f7] p-3">
                <h3 className="mb-2 text-[11px] font-bold text-[#71787d]">Account information</h3>
                <dl className="divide-y divide-[#dfe2e4] text-[11px]">
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Email:</dt><dd>{selectedMatch.email}</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Phone number:</dt><dd>{selectedMatch.phone}</dd></div>
                </dl>
              </section>

              <section className="rounded-[10px] bg-[#f5f6f7] p-3">
                <div className="mb-2 flex items-center justify-between"><h3 className="text-[11px] font-bold text-[#71787d]">Account metadata</h3><span className="text-xs text-[#71787d]">⌄</span></div>
                <dl className="divide-y divide-[#dfe2e4] text-[11px]">
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Account status:</dt><dd>Approved</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Account created:</dt><dd>{selectedMatch.created}</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Tokens owned:</dt><dd>{selectedMatch.tokens}</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Contracts signed:</dt><dd>{selectedMatch.contracts}</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Total connected IDs:</dt><dd>{selectedMatch.identities}</dd></div>
                </dl>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-bold text-[#71787d]">Latest connected digital ID</h3>
                <div className="flex gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[8px] bg-[#dfe2e4] text-[10px] text-[#858b90]">Photo</div>
                  <div className="text-[11px]"><p className="text-[#858b90]">Digital ID</p><p className="font-bold text-sm">{selectedMatch.digitalId}</p><p className="mt-2 text-[#858b90]">registered at {selectedMatch.registered}</p><p className="mt-1 text-[#858b90]">Status: <span className="ml-1 rounded bg-[#d8eeeb] px-2 py-0.5 font-semibold text-[#24766d]">Active</span></p></div>
                </div>
                <p className="mb-2 mt-4 text-[10px] text-[#858b90]">Attachments:</p>
                <div className="grid grid-cols-4 gap-1.5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex aspect-square items-center justify-center rounded-[4px] bg-[#dfe2e4] text-[9px] text-[#858b90]">[Attach.]</div>)}</div>
                <div className="mt-2 flex h-40 items-center justify-center rounded-[8px] bg-[#d0d4d6] text-[10px] text-[#71787d]">[Attachment preview]</div>
              </section>

              <section className="rounded-[10px] bg-[#f5f6f7] p-3">
                <h3 className="mb-2 text-[11px] font-bold text-[#71787d]">Identity information</h3>
                <dl className="divide-y divide-[#dfe2e4] text-[11px]">
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">First name:</dt><dd>Alex <span className="float-right rounded bg-[#d8eeeb] px-1.5 text-[#24766d]">Match</span></dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Last name:</dt><dd>Morgan <span className="float-right rounded bg-[#d8eeeb] px-1.5 text-[#24766d]">Match</span></dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Identity number:</dt><dd>19901210-0569 <span className="float-right rounded bg-[#d8eeeb] px-1.5 text-[#24766d]">Match</span></dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Nationality:</dt><dd>SE</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Address:</dt><dd>Storgatan 12, Stockholm <span className="float-right rounded bg-[#d8eeeb] px-1.5 text-[#24766d]">Match</span></dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Date of birth:</dt><dd>1990-12-10 <span className="float-right rounded bg-[#f9dce1] px-1.5 text-[#c64d63]">Conflict</span></dd></div>
                </dl>
              </section>
              <section className="rounded-[10px] bg-[#f5f6f7] p-3">
                <div className="mb-2 flex items-center justify-between"><h3 className="text-[11px] font-bold text-[#71787d]">Identity metadata</h3><span className="text-xs text-[#71787d]">⌄</span></div>
                <dl className="divide-y divide-[#dfe2e4] text-[11px]">
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">ID status:</dt><dd>Approved</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">ID number:</dt><dd>da67fd3v23fg</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">Application made:</dt><dd>{selectedMatch.created}</dd></div>
                  <div className="grid grid-cols-[42%_1fr] py-2"><dt className="text-[#858b90]">ID approved by:</dt><dd className="text-[#3971b9]">Jonathan Smith</dd></div>
                </dl>
              </section>

              <section className="border-t border-[#dfe2e4] pt-4">
                <h3 className="mb-3 text-[11px] font-bold text-[#181f25]">Reviewer verification</h3>
                <p className="mb-2 text-[10px] text-[#858b90]">Account:</p>
                <label className="flex min-h-10 items-center gap-2 bg-[#f5f6f7] px-2 text-[10px] leading-[12px] text-[#4f565b]"><input type="checkbox" className="h-3.5 w-3.5 shrink-0 accent-[#8f40d4]" />The verified contact details in the recovery request matches the account information of THIS account</label>
                <p className="mb-2 mt-3 text-[10px] text-[#858b90]">ID:</p>
                <div className="space-y-1">
                  <label className="flex min-h-9 items-center gap-2 bg-[#f5f6f7] px-2 text-[10px] text-[#4f565b]"><input type="checkbox" className="h-3.5 w-3.5 shrink-0 accent-[#8f40d4]" />ID document in the recovery request belongs to THIS account owner</label>
                  <label className="flex min-h-9 items-center gap-2 bg-[#f0ddff] px-2 text-[10px] text-[#4f565b]"><input type="checkbox" checked readOnly className="h-3.5 w-3.5 shrink-0 accent-[#8f40d4]" />All recovery information matches THIS account</label>
                  <label className="flex min-h-9 items-center gap-2 bg-[#f5f6f7] px-2 text-[10px] text-[#4f565b]"><input type="checkbox" className="h-3.5 w-3.5 shrink-0 accent-[#8f40d4]" />Selfie matches the photo(s) on THIS digital ID</label>
                </div>
                <label htmlFor="potential-audit-note" className="mb-1 mt-4 block text-[10px] text-[#858b90]">Audit note (optional)</label>
                <textarea id="potential-audit-note" placeholder="Message here" className="h-20 w-full resize-none rounded-[6px] border border-[#dfe2e4] bg-[#f7f8f9] p-2 text-[11px] outline-none placeholder:text-[#858b90] focus:border-[#8f40d4]" />
                <p className="mt-2 text-[10px] leading-[12px] text-[#858b90]">Reinstating this account will obsolete any active ID. The user will have to apply for a new digital ID after their account has been reinstated.</p>
                <label className="mt-4 flex gap-2 rounded-[6px] bg-[#f5f6f7] p-3 text-[10px] leading-[12px] text-[#4f565b]">
                  <input type="checkbox" checked={reinstatementConfirmed} onChange={(event) => setReinstatementConfirmed(event.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#8f40d4]" />
                  I personally ensure that all the above fields in the reviewer verification are correct, and that the recovery requester is the same person as the owner of this above account
                </label>
                <button type="button" disabled={!reinstatementConfirmed} className={`mt-4 h-9 w-full rounded-[8px] text-[11px] font-semibold ${reinstatementConfirmed ? 'bg-[#8f40d4] text-white' : 'bg-[#dfe2e4] text-[#858b90]'}`}>Reinstate this account</button>
              </section>
            </div>
          )}
        </aside>
      )}
      </div>
    </div>
  );
}


export const AccessContent = ({ applicationType = 'ID', title }) => {
    const { language } = useLanguage()
    const t = content[language]
    const searchParams = useSearchParams()  //Check the page number in the url
    const pathname = usePathname()
    const params = new URLSearchParams(searchParams)
    const pathnameWithFilter = `${pathname}?${params}`
    const filterAccount = searchParams.get('filter') || 'all'
    const query = searchParams.get('query') || ''
    const [toggle, setToggle] = useState(false)
    const [userList, setUserList] = useState(applicationType === 'AccountRecovery' ? [MOCK_RECOVERY_APPLICATION] : null)
  const rawLimit = searchParams.get('limit') || '50'
  const limit = rawLimit === 'all' ? MAX_ITEMS : rawLimit
    const page = Number(searchParams.get('page') || 1)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    const [id, setId] = useState('')
    const isFetchingRef = useRef(false)
  const [selectedUser, setSelectedUser] = useState(null)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(applicationType === 'AccountRecovery' ? 1 : 0)
    const [mockRecoveryOpen, setMockRecoveryOpen] = useState(false)
  
    
    async function getData() {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
        if (pathname.includes('id-application')) {
            const requestBody = {
              page,
              limit,                 // supports 'all'
              state: "Created",
              filter: { FIRST: query },
            };
            if (applicationType !== 'ID') requestBody.applicationType = applicationType;

          const res = await fetch("/api/legal-identities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!res.ok) throw new Error("Failed to fetch pending applications");
          const data = await res.json();
          console.log("data:", data);
          const payload = data?.data;
          const items = Array.isArray(payload?.items) ? payload.items : [];
          const totalItems = Number(payload?.totalItems ?? 0);

          const visibleItems = applicationType === 'AccountRecovery'
            ? [MOCK_RECOVERY_APPLICATION, ...items.filter((item) => !item?.isMockRecoveryApplication)]
            : items;
          const visibleTotalItems = applicationType === 'AccountRecovery' ? totalItems + 1 : totalItems;
          setUserList(visibleItems);
          setTotalPages(visibleTotalItems);
          setTotalItems(visibleTotalItems);
        } else {
              const url = `/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}&filter=${filterAccount}`;
              const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });

              if (!res.ok) throw new Error("Could not fetch userList");
              
              const data = await res.json();
          console.log("data:", data);

              setUserList(data.data || []);

              setTotalPages(data.totalPages || 38);
              setTotalItems(
                (typeof data.items === 'number' && data.items) ||
                (typeof data.totalItems === 'number' && data.totalItems) ||
                (typeof data.total === 'number' && data.total) ||
                (Array.isArray(data.data) ? data.data.length : 0)
              );
          }
      } catch (error) {
          console.error(error);
          if (applicationType === 'AccountRecovery') {
            setUserList([MOCK_RECOVERY_APPLICATION]);
            setTotalPages(1);
            setTotalItems(1);
          }
      } finally {

          isFetchingRef.current = false
      }
  }
    
    useEffect(() => {
   
      getData();
  }, [page, query,filterAccount,pathname,limit]);
    
  async function onHandleModal(action = actionButtonName, reason = ''){
    try {
        const changeState = await pendingAction(id, action, {
          user: selectedUser,
          reason,
          sendNotification: true,
        })

        if (!changeState.ok) {
          throw new Error(changeState.data?.message || 'Failed to change identity state')
        }

        const notification = changeState.data?.data?.notification
        if (notification && notification.success === false) {
          console.error('Identity state changed, but notification failed:', notification.error, notification.details)
        }

        getData()
        setToggle(false)
        return true
     } catch (error) {
         console.error(error)
         return false
     }
}


  async function onToggleHandler(userId, btnName, btnText) {
    setToggle(true)
    setActionButtonName(btnName)
    setButtonName(btnText)
    setId(userId)

    try {
      const res = await fetch('/api/legalIdentity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legalIdentity: userId }),
      })

      const result = await res.json()

      if (res.ok && result?.data) {
        setSelectedUser(result.data)
      } else {
        console.error('Failed to fetch user:', result?.message || 'Unknown error')
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Error in onToggleHandler:', err)
      setSelectedUser(null)
    }
  }



// function onToggleHandler(id,btnName,btnText){
//     setToggle((prev => !prev))
//     setActionButtonName(btnName)
//     setButtonName(btnText)
//     setId(id)
// }
 
   {/* To hide Id name and State column in Accounts page if you filter for Unverifed ID */}  
const baseColumns = userColoumnsAccount(language);
const filteredColumns = filterAccount === 'noID'
  ? baseColumns.filter(col => col.accessorKey !== 'name' && col.accessorKey !== 'state')
  : baseColumns;
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
            <div className="px-5">
           
            {pathname === '/neuro-access/account' && (
              <PaginatedList 
                userList={Array.isArray(userList) ? userList:[]} 
                page={page}
                totalPages={totalPages}
                prevPage={prevPage}
                limit={limit}
                customCellRenderers={customCellAcountTable(language)}
                userColoumns={filteredColumns}
                pending={false}
                query={query}
                totalItems={totalItems}
          />
        )}

              {pathname === '/neuro-access/id-application' && (
                <PaginatedList 
                  userList={Array.isArray(userList) ? userList:[]} 
                  page={page}
                  totalPages={totalPages}
                  prevPage={prevPage}
                  limit={limit}
                  customCellRenderers={customCellPendingTable}
                  userColoumns={userColoumnsPending(language)}
                  renderRowActions={(props) => pendingActions({...props,onToggleHandler,pathnameWithFilter, language})}
                  pending={true}
                  totalItems={totalItems}
                  title={title || (applicationType === 'ID' ? 'ID applications' : 'Account recovery applications')}
                  onRowClick={applicationType === 'AccountRecovery' ? (row) => {
                    if (row.isMockRecoveryApplication) {
                      setMockRecoveryOpen(true);
                      return true;
                    }
                    return false;
                  } : undefined}
          />
        )}

        {/* Modal */}
        {toggle && selectedUser && (
          <Modal
            text={getModalText(actionButtonName, buttonName, t)}
            setToggle={setToggle}
            user={selectedUser}
            loading={false}
            handleApprove={() => onHandleModal('Approved')}
            handleReject={(reason) => onHandleModal('Rejected', reason)}
          />
        )}


      {mockRecoveryOpen && <MockRecoveryPanel onClose={() => setMockRecoveryOpen(false)} />}

      </div>

    )
  }
