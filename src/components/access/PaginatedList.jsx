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
                        <p className='text-xl font-semibold pb-4'>Pending ID applications</p>
                    ) : <p className='text-xl font-semibold pb-4'>Account and ID</p>
                    
                }
                {
                    pending == false && (
                        <div className='grid grid-cols-3 w-[250px] text-center items-center cursor-pointer'>
                          
                             
                        <Link className={`transition-all border rounded-lg ${filterAccount === 'all' ? 'bg-neuroPurpleLight'
                             : 'bg-neuroGray text-neuroTextBlack/60' }`} href={'/list/access/?filter-accounts=all'}>All</Link>                          
                            <Link className={`transition-all border rounded-lg ${filterAccount === 'hasID' ? 'bg-neuroPurpleLight'
                             : 'bg-neuroGray text-neuroTextBlack/60' }`} href={'/list/access/?filter-accounts=hasID'}>Has ID</Link>                       
                            <Link className={`transition-all border rounded-lg ${filterAccount === 'noID' ? 'bg-neuroPurpleLight'
                             : 'bg-neuroGray text-neuroTextBlack/60' }`} href={'/list/access/?filter-accounts=noID'}>No ID</Link>                       
                        </div>
                    )
                }
                </div>
                <SearchBar placeholder={'Search...'} classNameText={'w-[30%] border-2 rounded-md py-2 pr-10 pl-12 text-sm'} />
            </div>
                <TableComponent
                    data={userList}
                    columns={userColoumns}
                    enableRowActions={true}
                    enableGlobalFilter={false}
                    customCellRenderers={customCellRenderers}
                    renderRowActionMenuItems={renderRowActions}
                />
                <Pagination page={page} prevPage={prevPage} totalPages={totalPages} limit={limit} />
            </div>
            
            
        </div>
    </div>
);
};
