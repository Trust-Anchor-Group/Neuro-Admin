'use client'
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react'
import { FaChartLine, FaRegFileAlt, FaFirstOrderAlt } from 'react-icons/fa';
import Manage from '@/components/assets/Manage';
import Overview from '@/components/assets/Overview';
import { Suspense } from 'react';
import AssetOrdersTable from '@/components/assets/orders/AssetOrdersTable';




const DetailPageClient = () => {
   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'overview'

  const ordersData = {
    loading: false,
    orders: [],
  };

  return (
    <div className='p-5'>
      <TabNavigation tab={tab} id={id} gridCols={'grid-cols-3'} tabArray={[
          {
              title:'Overview',
              href:'/neuro-assets/detailpageclient',
              tabDesination:'overview',
              icon:FaRegFileAlt,
              tabRef:'overview'
          },
          {   
              title:'Orders',
              href:'/neuro-assets/detailpageclient',
              tabDesination:'orders',
              icon:FaFirstOrderAlt,
              tabRef:'orders'

          },
                    {   
              title:'Manage',
              href:'/neuro-assets/detailpageclient',
              tabDesination:'manage',
              icon:FaChartLine,
              tabRef:'manage'

          }
      ]}/> 
      <div className='mt-5'>
        {
            tab === 'overview' && 
            <Overview />
        }
        {
            tab === 'orders' &&
            <div className='rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5'>
              <h1 className='font-semibold text-xl mb-5 text-[var(--brand-text)]'>Orders</h1>
              <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">Loading orders...</p>}>
                <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
              </Suspense>
            </div>
        }
        {
            tab === 'manage' &&
            <Manage />
        }
      </div>
  
    </div>
                
                

  )
}

export default DetailPageClient
