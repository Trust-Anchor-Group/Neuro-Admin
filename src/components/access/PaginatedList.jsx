'use client'
import React, { useState } from 'react'
import TableComponent from './TableComponent';
import SearchBar from '../SearchBar';
import { Filter} from '../shared/Filter';
import Link from 'next/link';
import { ThemeProvider } from '@mui/material';
import { theme } from './accountTableList';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage, content } from '../../../context/LanguageContext';

export const PaginatedList = ({ userList, page, prevPage, totalPages,
    limit,
    customCellRenderers,
    userColoumns,
    renderRowActions = false,
    pending,
    query,
    totalItems,
    }) => {

const searchParams = useSearchParams()
const { language } = useLanguage();
const t = content?.[language] || {};
const [showFallback, setShowFallback] = useState(false)

const buildUrlWithParams = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page',1)
    if (key !== 'query' && query) {
      params.set('query', query); // preserve query
    }
    return `/neuro-access/${pending ? 'id-application' : 'account'}?${params.toString()}`;
  };   

    //  If you plan to use the table on a different page, make sure to wrap both the <TableComponent />
    //  and <Pagination /> inside a <div className="relative">.
    //  This ensures that the table and pagination are always rendered together, preventing layout issues.

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, []);

  

    if (!userList && showFallback) {
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
            <div className="absolute top-0 left-0 w-full p-5">
                <div className='flex justify-between'>

                                {pending ? (
                                    <p className='text-text20 font-semibold pb-4'>
                                        {t?.PaginatedList?.titleIdApplications || 'ID applications'}
                                    </p>
                                ) : (
                                    <p className='text-text20 font-semibold pb-4'>
                                        {t?.PaginatedList?.titleAccounts || 'Accounts'}
                                    </p>
                                )}
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                    <SearchBar placeholder={t?.PaginatedList?.searchPlaceholder || 'Search...'} classNameText={'border-2 rounded-md py-2 pr-10 pl-12 text-sm max-sm:pr-0 max-sm:pl-2'} />
                    {/* FilterAccount */}
                    { pending === false && 
                    <div className='hidden md:block'>
                        <Filter linkArray={[
                            { linkHref: buildUrlWithParams('filter', 'all'), text: t?.PaginatedList?.filterAll || 'All' },
                            { linkHref: buildUrlWithParams('filter', 'hasID'), text: t?.PaginatedList?.filterHasId || 'Has Id' },
                            { linkHref: buildUrlWithParams('filter', 'noID'), text: t?.PaginatedList?.filterNoId || 'No Id' },
                        ]}
                        isFilterAccount={true}
                        absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                        size={'w-[170px]'}/>
                    </div>
                    }
                     <div className='hidden md:block'>
                    {/* FilterLimit */}
                    
                        { /* Show all: use a semantic 'all' value so parent can handle it */ }
                        {(
                            <Filter linkArray={[
                            { linkHref: buildUrlWithParams('limit', '10'), text: t?.PaginatedList?.limit10 || '10' },
                            { linkHref: buildUrlWithParams('limit', '25'), text: t?.PaginatedList?.limit25 || '25' },
                            { linkHref: buildUrlWithParams('limit', '50'), text: t?.PaginatedList?.limit50 || '50' },
                            { linkHref: buildUrlWithParams('limit', 'all'), text: t?.PaginatedList?.limitAll || 'Show all' },
                        ]}
                        isFilterAccount={false}
                        absoluteClassName={'absolute top-9 left-0 z-10 flex bg-white flex-col w-full cursor-pointer'}
                        size={'w-[100px]'}/> )}
                    </div>
                    </div>
                    {/* Remove separate Pagination; MRT handles pagination */}
                </div>
            </div>
            <ThemeProvider theme={theme}>
                {
                    userList &&
                <TableComponent
                data={userList}
                columns={userColoumns}
                enableRowActions={true}
                enableGlobalFilter={false}
                customCellRenderers={customCellRenderers}
                renderRowActionMenuItems={renderRowActions}
                page={page}
                limit={limit}
                totalItems={totalPages}
                />
            }
            </ThemeProvider>
                {/* Mobile pagination removed; MRT provides built-in controls */}
            </div>
            
            
        </div>
    </div>
);
};
