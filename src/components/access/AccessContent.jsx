'use client'
import { PaginatedList } from '@/components/access/PaginatedList'
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import config from '@/config/config';
import { userColoumnsAccount,customCellAcountTable,accountActions } from './accountTableList.js'
import {userColoumnsPending,customCellPendingTable,pendingActions} from './pendingTable.js'
import { FaHourglassHalf, FaSpinner, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link.js';
import { Modal } from '../shared/Modal.jsx';
import { pendingAction } from './pendingFetch.js';
import { getModalText } from '@/utils/getModalText.js';


// Max items used when limit=all
const MAX_ITEMS = 1000000;


export const AccessContent = () => {
    const searchParams = useSearchParams()  //Check the page number in the url
    const pathname = usePathname()
    const params = new URLSearchParams(searchParams)
    const pathnameWithFilter = `${pathname}?${params}`
    const filterAccount = searchParams.get('filter') || 'all'
    const query = searchParams.get('query') || ''
    const [toggle, setToggle] = useState(false)
    const [userList, setUserList] = useState(null)
  const rawLimit = searchParams.get('limit') || '50'
  const limit = rawLimit === 'all' ? MAX_ITEMS : rawLimit
    const page = Number(searchParams.get('page') || 1)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    const [id, setId] = useState('')
    const isFetchingRef = useRef(false)
  const [selectedUser, setSelectedUser] = useState(null)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
  
    //fetch data depending if you are in ID application or accounts
    async function getData() {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
          if (pathname.includes('id-application')) {
              const requestBody = {
                  offset: rawLimit === 'all' ? 0 : (page - 1) * limit,
                  maxCount: limit,
                  state: "Created",
                  
                  filter: {
                    FIRST:query
                  },
              };

              const res = await fetch("/api/legal-identities", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(requestBody),
              });

              if (!res.ok) throw new Error("Failed to fetch pending applications");
              const data = await res.json();
              setUserList(data.data || []);
              console.log('ID application',data)
              setTotalPages(data.totalPages || 1);
              setTotalItems(
                (typeof data.items === 'number' && data.items) ||
                (typeof data.totalItems === 'number' && data.totalItems) ||
                (typeof data.total === 'number' && data.total) ||
                (Array.isArray(data.data) ? data.data.length : 0)
              );
          } else {
              const url = `/api/mockdata?page=${rawLimit === 'all' ? 1 : page}&limit=${limit}&query=${encodeURIComponent(query)}&filter=${filterAccount}`;
              const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });

              if (!res.ok) throw new Error("Could not fetch userList");
              
              const data = await res.json();

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
      } finally {

          isFetchingRef.current = false
      }
  }
    
    useEffect(() => {
   
      getData();
  }, [page, query,filterAccount,pathname,limit]);
    
  async function onHandleModal(){
    try {
        await pendingAction(id,actionButtonName)
        getData()
        setToggle(false)
     } catch (error) {
         console.log(error)
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
const filteredColumns = filterAccount === 'noID'
  ? userColoumnsAccount.filter(col => col.accessorKey !== 'name' && col.accessorKey !== 'state')
  : userColoumnsAccount;
  
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
                customCellRenderers={customCellAcountTable}
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
                  userColoumns={userColoumnsPending}
                  renderRowActions={(props) => pendingActions({...props,onToggleHandler,pathnameWithFilter})}
                  pending={true}
                  totalItems={totalItems}
          />
        )}

        {/* Modal */}
        {toggle && selectedUser && (
          <Modal
            text={getModalText(actionButtonName, buttonName)}
            setToggle={setToggle}
            onHandleModal={onHandleModal}
            user={selectedUser}
            loading={false}
            handleApprove={() => onHandleModal('approve')}
            handleReject={(reason) => onHandleModal('deny', reason)}
          />
        )}





      </div>

    )
  }