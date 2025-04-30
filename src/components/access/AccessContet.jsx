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



export const AccessContet = () => {
    const searchParams = useSearchParams()  //Check the page number in the url
    const pathname = usePathname()
    const filterAccount = searchParams.get('filter-accounts') || 'all'
    const query = searchParams.get('query') || ''
    const [toggle, setToggle] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userList, setUserList] = useState(null)
    let limit = 10
    const page = Number(searchParams.get('page') || 1)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    const [id, setId] = useState('')
    const isFetchingRef = useRef(false)

    const [totalPages, setTotalPages] = useState(0)
  
    //fetch data depending if you are in ID application or accounts
    async function getData() {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setLoading(true)
      try {
          if (pathname.includes('id-application')) {
              const requestBody = {
                  offset: (page - 1) * limit,
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
              setTotalPages(data.totalPages || 38);
          } else {
              const url = `${config.protocol}://${config.origin}/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}&filter=${filterAccount}`;
              const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
              if (!res.ok) throw new Error("Could not fetch userList");
              
              const data = await res.json();

              setUserList(data.data || []);
              console.log('Accounts',data)
              setTotalPages(data.totalPages || 38);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
          isFetchingRef.current = false
      }
  }
    
    useEffect(() => {
   
      getData();
  }, [page, query,filterAccount,pathname]);
    
  async function onHandleModal(){
    try {
        await pendingAction(id,actionButtonName)
        getData()
        setToggle(false)
     } catch (error) {
         console.log(error)
     }
}





function onToggleHandler(id,btnName,btnText){
    setToggle((prev => !prev))
    setActionButtonName(btnName)
    setButtonName(btnText)
    setId(id)
}
 
   {/* To hide Id name and State column in Accounts page if you filter for Unverifed ID */}  
const filteredColumns = filterAccount === 'noID'
  ? userColoumnsAccount.filter(col => col.accessorKey !== 'name' && col.accessorKey !== 'state')
  : userColoumnsAccount;
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
            <div className="relative px-5">
           
            {pathname === '/neuro-access/account' && (
              <PaginatedList 
                userList={userList} 
                page={page}
                totalPages={totalPages}
                prevPage={prevPage}
                limit={limit}
                customCellRenderers={customCellAcountTable}
                userColoumns={filteredColumns}
                pending={false}
                filterAccount={filterAccount}
          />
        )}

              {pathname === '/neuro-access/id-application' && (
                <PaginatedList 
                  userList={userList} 
                  page={page}
                  totalPages={totalPages}
                  prevPage={prevPage}
                  limit={limit}
                  customCellRenderers={customCellPendingTable}
                  userColoumns={userColoumnsPending}
                  renderRowActions={(props) => pendingActions({...props,onToggleHandler})}
                  pending={true}
          />
        )}

        {/* Modal */}
        {toggle && (
          <Modal 
            text={`Are you sure you want to ${buttonName}?`}
            setToggle={setToggle}
            onHandleModal={onHandleModal}
          />
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50  flex items-center justify-center z-50">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </div>
        )}
      </div>

    )
  }