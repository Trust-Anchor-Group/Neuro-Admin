import { PaginatedList } from '@/components/access/PaginatedList'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import config from '@/config/config';
import Link from 'next/link';
import {customCellCurrentIdsTable,userColoumnsCurrentIds, currentIdActions} from './currentIdsTable.js'
import {userColoumnsPending,customCellPendingTable,pendingActions} from './pendingTable.js'
import { FaSpinner } from 'react-icons/fa';
import { pendingAction } from './pendingFetch.js';
import { Modal } from '../shared/Modal.jsx';


export const AdminContent = () => {
    const searchParams = useSearchParams()  //Check the page number in the url

    const query = searchParams.get('query') || ''
    
    const tab = searchParams.get('tab') || 'current'
    const [userList, setUserList] = useState(null)
    let limit = 10
    const page = Number(searchParams.get('page') || 1)
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [toggle, setToggle] = useState(false)
    const [actionButtonName, setActionButtonName] = useState('')
    const [buttonName, setButtonName] = useState('')
    const [id, setId] = useState('')
    
    async function getData(){
      try {
        setLoading(true)
        let endpoint = tab === "pending"
        ? "/api/pending"
        : "/api/mockdata"

        
        const url = `${config.protocol}://${config.origin}${endpoint}?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`;
        console.log(url)
        const res = await fetch(url, {
          method:'GET',
          headers:{
            'Content-Type':'application/json',       
          },
          credentials:'include'
        })
  
        const data = await res.json()
        console.log(data)
        
        setUserList(data.data)
        setTotalPages(38)
        console.log(userList)
      } catch (error) {
        throw new Error('Could not get userList',error)  
      } finally {
        setLoading(false)
    }

    }
    useEffect(() => {
    //Fetch data from backend
  
      getData()
    }, [page,limit,query,tab])

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
    
    
  
 
  
  
    const prevPage = page - 1 > 0 ? page - 1 : 1

    return (
      <div>
          <div className='p-5'>
          <div>
            <h1 className="mb-2 text-xl font-semibold md:text-3xl">Identity&nbsp;Management</h1>
            <p className='text-lg opacity-70 max-sm:text-sm'>Manage identity verification and roles</p>
                </div>
                <nav className="grid grid-cols-2 py-2 px-4 mt-5 bg-gray-200 text-center rounded-lg">
                    <Link href="/list/access/admin/?tab=current&page=1">
                    <p className={`text-lg ${tab === 'current' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Current Ids</p>
                    </Link>
                    <Link href="/list/access/admin/?tab=pending&page=1">
                    <p className={`text-lg ${tab === 'pending' ? 'bg-white/90 rounded-lg duration-300' : 'text-gray-600'}`}>Pending Applications</p>
                    </Link>
                </nav>
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
                        customCellRenderers={customCellCurrentIdsTable}
                        userColoumns={userColoumnsCurrentIds}
                        renderRowActions={(props) => currentIdActions({...props,onToggleHandler})}
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
                        renderRowActions={(props) => pendingActions({...props,onToggleHandler})}
                        />
                    </div>
                )}
                </>
              }
          </div>
      </div>
    )
  }