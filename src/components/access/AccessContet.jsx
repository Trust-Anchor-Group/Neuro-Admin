import { PaginatedList } from '@/components/access/PaginatedList'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import config from '@/config/config';
import { userColoumnsAccount,customCellAcountTable,accountActions } from './accountTableList.js'
import {userColoumnsPending,customCellPendingTable,pendingActions} from './pendingTable.js'
import { FaSpinner } from 'react-icons/fa';
import Link from 'next/link.js';



export const AccessContet = () => {
    const searchParams = useSearchParams()  //Check the page number in the url
    const tab = searchParams.get('tab') || 'current'
    const query = searchParams.get('query') || ''
    const [toggle, setToggle] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userList, setUserList] = useState(null)
    let limit = 10
    const page = Number(searchParams.get('page') || 1)

    const [totalPages, setTotalPages] = useState(0)
    
    useEffect(() => {
      async function getData() {
          setLoading(true);
          try {
              if (tab === 'pending') {
                  const requestBody = {
                      offset: (page - 1) * limit,
                      maxCount: limit,
                      state: "Created",
                      createdFrom: 1704078000,
                      filter: {},
                  };

                  const res = await fetch("/api/legal-identities", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(requestBody),
                  });

                  if (!res.ok) throw new Error("Failed to fetch pending applications");
                  const data = await res.json();
                  setUserList(data.data || []);
                  setTotalPages(data.totalPages || 38);
              } else {
                  const url = `${config.protocol}://${config.origin}/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`;
                  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
                  if (!res.ok) throw new Error("Could not fetch userList");
                  const data = await res.json();
                  setUserList(data.data || []);
                  setTotalPages(data.totalPages || 38);
              }
          } catch (error) {
              console.error(error);
          } finally {
              setLoading(false);
          }
      }
      getData();
  }, [page, query, tab]);
    
  
 
  
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
      <div>
          <div className='p-5 max-sm:p-0'>
            <div className='flex justify-between items-center'>
              <div>
                      <h1 className="mb-2 text-xl font-semibold md:text-3xl">Accounts</h1>
                      <p className='text-lg opacity-70 max-sm:text-sm'>Manage user accounts and permissions</p>
                  </div>
            </div>
            <nav className="grid grid-cols-2 w-full md:w-[50%] gap-5 py-1 px-2 mt-5 bg-gray-200 text-center rounded-lg">
                    <Link href="/list/access/?tab=current&page=1">
                    <p className={`text-lg ${tab === 'current' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Accounts</p>
                    </Link>
                    <Link href="/list/access/?tab=pending&page=1">
                    <p className={`text-lg ${tab === 'pending' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Pending&nbsp;Applications</p>
                    </Link>
                </nav>
            <div className=''>
                       {
                         loading ? (
                           <div className='flex justify-center items-center mt-12'>
                             <FaSpinner className='animate-spin text-5xl'/>
                           </div>
                         ) :
                         <>
                       {tab === 'current' && (
                         <div className=''>
                         <PaginatedList 
                                 userList={userList} 
                                 page={page}
                                 totalPages={totalPages}
                                 prevPage={prevPage}
                                 limit={limit}
                                 customCellRenderers={customCellAcountTable}
                                 userColoumns={userColoumnsAccount}
                                 renderRowActions={accountActions}
                             />
                         </div>
                         )}
                              {
                               toggle &&
                                         <Modal 
                                             text={`Are you sure you want to ${buttonName}?`}
                                             setToggle={setToggle}
                                             onHandleModal={onHandleModal}/>
                               }
                                             
                         {tab === 'pending' && (
                           <div>
                             <PaginatedList 
                                 userList={userList} 
                                 page={page}
                                 totalPages={totalPages}
                                 prevPage={prevPage}
                                 limit={limit}
                                 customCellRenderers={customCellPendingTable}
                                 userColoumns={userColoumnsPending}
                                 renderRowActions={pendingActions}
                                 />
                             </div>
                         )}
                         </>
                       }
            </div>
          </div>
      </div>
    )
  }