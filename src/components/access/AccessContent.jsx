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

function MockRecoveryPanel({ onClose }) {
  const [selectedAttachment, setSelectedAttachment] = useState('Profile photo');
  const [flow, setFlow] = useState(null);
  const [checkedItems, setCheckedItems] = useState({ identity: false, selfie: false, differentPhotos: false, recovery: false });
  const attachments = [
    { name: 'Profile photo', left: '5.24%', top: '5.08%' },
    { name: 'Identity document, front', left: '26.21%', top: '5.08%' },
    { name: 'Identity document, back', left: '47.18%', top: '5.08%' },
    { name: 'Selfie', left: '68.15%', top: '5.08%' },
    { name: 'Proof of address', left: '5.24%', top: '11.08%' },
    { name: 'Recovery code', left: '26.21%', top: '11.08%' },
  ];
  const toggleCheck = (key) => setCheckedItems((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101418]/75 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-[496px] overflow-y-auto rounded-[8px] shadow-2xl" role="dialog" aria-modal="true" aria-label="Account recovery application">
        {flow ? (
          <div className="flex min-h-[420px] flex-col rounded-[8px] bg-white p-6 text-[#181f25]">
            <button type="button" onClick={() => setFlow(null)} className="self-start text-sm font-semibold text-[#71787d] hover:text-[#181f25]">← Back to request</button>
            <div className="my-auto">
              <h2 className="text-2xl font-bold">{flow === 'deny' ? 'Deny application' : 'Find account'}</h2>
              <p className="mt-3 text-sm text-[#71787d]">Add the information and actions for this flow here later.</p>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[496/1733] w-full">
            <img src="/account-recovery-panel.svg" alt="Account recovery application details" className="block h-full w-full" />
            {attachments.map((attachment) => (
              <button
                key={attachment.name}
                type="button"
                onClick={() => setSelectedAttachment(attachment.name)}
                className={`absolute h-[5.77%] w-[20.16%] rounded-[8px] ${selectedAttachment === attachment.name ? 'ring-2 ring-[#8f40d4] ring-offset-2' : ''}`}
                style={{ left: attachment.left, top: attachment.top }}
                aria-label={`Preview ${attachment.name}`}
              />
            ))}
            <div className="pointer-events-none absolute left-[5.24%] top-[17.31%] flex h-[16.1%] w-[89.52%] items-end p-3">
              <span className="rounded bg-white/90 px-2 py-1 text-xs font-semibold text-[#181f25] shadow-sm">{selectedAttachment}</span>
            </div>
            <fieldset className="absolute left-[5.24%] top-[77.5%] w-[89.52%] space-y-1 border-0 p-0" aria-label="Recovery request verification">
              <label className="flex h-9 cursor-pointer items-center gap-3 rounded-[4px] bg-[#f5f6f7] px-4 text-[11px] font-medium text-[#181f25]">
                <input type="checkbox" checked={checkedItems.identity} onChange={() => toggleCheck('identity')} className="h-4 w-4 shrink-0 accent-[#8f40d4]" />
                ID document in the recovery request is authentic and not expired
              </label>
              <label className="flex h-9 cursor-pointer items-center gap-3 rounded-[4px] bg-[#f5f6f7] px-4 text-[11px] font-medium text-[#181f25]">
                <input type="checkbox" checked={checkedItems.selfie} onChange={() => toggleCheck('selfie')} className="h-4 w-4 shrink-0 accent-[#8f40d4]" />
                Selfie matches the photo on the ID document
              </label>
              <label className="flex h-9 cursor-pointer items-center gap-3 rounded-[4px] bg-[#f5f6f7] px-4 text-[11px] font-medium text-[#181f25]">
                <input type="checkbox" checked={checkedItems.differentPhotos} onChange={() => toggleCheck('differentPhotos')} className="h-4 w-4 shrink-0 accent-[#8f40d4]" />
                The selfie and the ID document photo are not using the same photo
              </label>
              <label className="flex h-9 cursor-pointer items-center gap-3 rounded-[4px] bg-[#f5f6f7] px-4 text-[11px] font-medium text-[#181f25]">
                <input type="checkbox" checked={checkedItems.recovery} onChange={() => toggleCheck('recovery')} className="h-4 w-4 shrink-0 accent-[#8f40d4]" />
                All recovery information matches the ID document
              </label>
            </fieldset>
            <button type="button" onClick={() => setFlow('deny')} className="absolute left-[5.24%] top-[93.08%] h-[1.9%] w-[43.95%] rounded-[8px]" aria-label="Deny application" />
            <button type="button" onClick={() => setFlow('find-account')} className="absolute left-[50.8%] top-[93.08%] h-[1.9%] w-[43.95%] rounded-[8px]" aria-label="Find account" />
          </div>
        )}
      </section>
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
