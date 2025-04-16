import React from 'react'
import TableComponent from './TableComponent';
import { Pagination } from './Pagination';
import SearchBar from '../SearchBar';
import { FilterAccounts } from './FilterAccounts';
import Link from 'next/link';

export const PaginatedList = ({ userList, page, prevPage, totalPages,
    limit,
    customCellRenderers,
    userColoumns,
    renderRowActions = false,
    pending,
    filterAccount,
    }) => {

    //  If you plan to use the table on a different page, make sure to wrap both the <TableComponent />
    //  and <Pagination /> inside a <div className="relative">.
    //  This ensures that the table and pagination are always rendered together, preventing layout issues.

    if (!userList) {
        return (
            <div className="">
                <div className='flex justify-center items-center h-screen'>
                  <p className=" text-gray-600 text-xl max-sm:text-lg">Could not retrieve any data, try later</p>
                </div>
            </div>
        )
    }

    return (
        <div className="">
        <div className="mt-5 rounded-md overflow-hidden">
           
            <div className="relative">
            <div className="absolute top-0 left-0 w-full p-5 z-10">
                <div className='flex justify-between'>

                {
                    pending ? (
                        <p className='text-text20 font-semibold pb-4'>ID applications</p>
                    ) : <p className='text-text20 font-semibold pb-4'>Accounts</p>
                    
                }
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                    <SearchBar placeholder={'Search...'} classNameText={'border-2 rounded-md py-2 pr-10 pl-12 text-sm max-sm:pr-0 max-sm:pl-2'} />
                    { pending === false && 
                    <div className='hidden md:block'>
                        <FilterAccounts pending={pending} filterAccount={filterAccount}/>
                    </div>
                    }
                    </div>
                    <div className='hidden md:block'>
                        <Pagination page={page} prevPage={prevPage} totalPages={totalPages} limit={limit} />                
                    </div>
                </div>
            </div>
                <TableComponent
                    data={userList}
                    columns={userColoumns}
                    enableRowActions={true}
                    enableGlobalFilter={false}
                    customCellRenderers={customCellRenderers}
                    renderRowActionMenuItems={renderRowActions}
                />
                <div className='block py-2 md:hidden'>
                        <Pagination page={page} prevPage={prevPage} totalPages={totalPages} limit={limit} />                
                </div>
            </div>
            
            
        </div>
    </div>
);
};
