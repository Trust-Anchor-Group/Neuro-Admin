'use client'
import { DisplayDetailsAsset } from '@/components/assets/DisplayDetailsAsset'
import AssetOrdersTable from "@/components/assets/orders/AssetOrdersTable";
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
import { Activity } from "lucide-react";
// Using public logo asset; Next/Image can take a string path referencing /public
import React, { useContext, useMemo, useState, useCallback, useEffect, Suspense } from 'react'
import { FaCertificate, FaChartLine, FaRegFileAlt } from 'react-icons/fa';
import { StatusBox } from '@/components/assets/StatusBox';
import { CertificateBox } from '@/components/assets/CertificateBox';
import { PublishBox } from '@/components/assets/PublishBox';
import Image from 'next/image';
import { useLanguage } from '../../../../../../context/LanguageContext'
import { PdfButton } from '@/components/assets/PdfButton';
import { fetchOrders } from '@/lib/fetchOrders';





const DetailPageAssets = () => {


  const [ordersData, setOrdersData] = useState({ loading: true, orders: [] });
   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'order'

  const { language, content: translations } = useLanguage();
  const t = translations[language];
  const [publishStatus, setPublishStatus] = useState('published');
  // Fetch orders for certificate tab
  useEffect(() => {
    let mounted = true;
    if (tab === 'sales' && ordersData.loading) {
      (async () => {
        const data = await fetchOrders();
        if (mounted) setOrdersData(data);
      })();
    }
    return () => { mounted = false; };
  }, [tab, ordersData.loading]);

  const handlePublishSave = useCallback(async (nextStatus) => {
    const response = await fetch('/api/assets/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ assetId: id, status: nextStatus }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || 'Failed to update publish status');
    }

    const savedStatus = payload?.data?.status || nextStatus;
    setPublishStatus(savedStatus);
    return savedStatus;
  }, [id]);

  const summaryCards = [
    {
      label: t.Clients?.summary?.averageDailySales || 'Average daily sales',
      value: '14',
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
  ];

  const popularRegions = [
    'South America',
    'Central America',
    'Europe',
    'North America',
    'SE Asia',
  ];

  const userData = {
    orderName:'Sweden compensation 2024-2025',
    comment:'“Covers all flight C-comp. to and from Sweden”',
    orderType:'CO carbon capture',
    orderQuantity:'73.00 tons',
    orderDate:'2024-02-02, 15:29',
    orderedBy:'EcoTech Solutions',
    created:'2024-02-03, 08:30'
  }
  const productionData = {
    facility: 'Factory 3 Malmö, Sweden',
    method: 'Direct-air capture',
    startDate: '2024-03-31, 15:29',
    endDate: '2025-03-13, 15:29'
  }
  const productionFields = useMemo(() => [
    { label: t?.assetOrderDetail?.production?.facility || 'Facility', key: 'facility' },
    { label: t?.assetOrderDetail?.production?.method || 'Method', key: 'method' },
    { label: t?.assetOrderDetail?.production?.startDate || 'Start date', key: 'startDate' },
    { label: t?.assetOrderDetail?.production?.endDate || 'End date', key: 'endDate' },
  ], [t])

  // Pricing / Agreement data (third block)
  const pricingData = {
    agreement: 'Carbon capture EU (Q2 2025)\n €230.00 per ton',
  }

  const pricingFields = useMemo(() => [
    { label: t?.assetOrderDetail?.pricing?.agreement || 'Agreement', key: 'agreement' },
  ], [t])

  // Company Information block (fourth block)
  const companyData = {
    totalPrice: '204,210 EUR',
    paymentMethod: 'Invoice',
    paymentDue: '2025-03-28',
    paymentReceived: '2025-03-26, 15:29'
  }

  const companyFields = useMemo(() => [
    { label: t?.assetOrderDetail?.company?.totalPrice || 'Total price', key: 'totalPrice' },
    { label: t?.assetOrderDetail?.company?.paymentMethod || 'Payment method', key: 'paymentMethod' },
    { label: t?.assetOrderDetail?.company?.paymentDue || 'Payment due', key: 'paymentDue' },
    { label: t?.assetOrderDetail?.company?.paymentReceived || 'Payment received', key: 'paymentReceived' },
  ], [t])

  const fieldsToShow = useMemo(() => [
    { label: t?.assetOrderDetail?.fields?.orderName || 'Order Name', key: 'orderName' },
    { label: t?.assetOrderDetail?.fields?.comment || 'Comment', key: 'comment' },
    { label: t?.assetOrderDetail?.fields?.orderType || 'Order type', key: 'orderType' },
    { label: t?.assetOrderDetail?.fields?.orderQuantity || 'Order Quantity', key: 'orderQuantity' },
    { label: t?.assetOrderDetail?.fields?.orderDate || 'Order Date', key: 'orderDate' },
    { label: t?.assetOrderDetail?.fields?.orderedBy || 'Ordered By', key: 'orderedBy' },
    { label: t?.assetOrderDetail?.fields?.created || 'Created', key: 'created' },
  ], [t])

  const headTitle = {
    title: 'Coffee Bean',
    credit: '204-210 EUR',
    created: '2024-02-03',
    tons: '73 tons |230.30 per ton',
    image: '/neuroAdminLogo.svg', // served from public/neuroAdminLogo.svg
    issuer: 'Bress Capital',
  };

  const statusCard = {
    progress:'75',
    amount:'47 of 73 tons',
    status:'In progress'
  }  

  // Payment status card (duplicate of StatusBox for payment tracking)
  const paymentStatusCard = {
    progress: '100',
    status: 'Complete',
  }


  return (
    <div className='p-5'>
    <TabNavigation tab={tab} id={id} gridCols={'grid-cols-2'} tabArray={[
      {
        title: t?.assetOrderDetail?.tabs?.token || 'Order detail',
        href:'/neuro-assets/detailpage',
        tabDesination:'order&overview',
        icon:FaRegFileAlt,
        tabRef:'order'
      },
      {   
        title: t?.assetOrderDetail?.tabs?.certificat || 'Sales',
        href:'/neuro-assets/detailpage',
        tabDesination:'sales',
        icon:FaCertificate,
        tabRef:'sales'

      },
    ]}/> 
      <div className='mt-5'>

      {
        tab === 'order' && 
        <>
        <div className='grid grid-cols-4 gap-5'>
          <div className='col-span-3'>
            <DisplayDetailsAsset
              fieldsToShow={fieldsToShow}
              userData={userData}
              title={'Order details'}
              header={headTitle}
              extraData={productionData}
              extraFields={productionFields}
              extraTitle={'Production process'}
              extraPrice={pricingData}
              priceFields={pricingFields}
              priceTitle={'Pricing agreement'}
              extraCompany={companyData}
              companyFields={companyFields}
              companyTitle={'Company Information'}
            />
          </div>
          <div className='col-start-4 col-end-5 flex flex-col items-start gap-5 mt-5'>
            <PublishBox status={publishStatus} onSave={handlePublishSave}/>
            <StatusBox statusCard={statusCard} title={'Asset status'} />
            <StatusBox statusCard={paymentStatusCard} title={'Sales status'} />
            <CertificateBox/>
          </div>
        </div>
        </>
      }
            {
              tab === 'sales' &&
              <div className='grid grid-cols-4 gap-5'>
                <div className='mx-auto col-span-3 w-full bg-[var(--brand-navbar)] shadow-md p-5 rounded-lg '>
                  <h1 className='font-semibold text-xl mb-5'>
                    Sales
                  </h1>
                  <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading || 'Loading orders...'}</p>}>
                    <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
                  </Suspense>
                </div>
                <div className='flex flex-col gap-5'>
                  <StatusBox statusCard={paymentStatusCard} title={'Sales status'} />
                  {summaryCards.map(({ label, value, Icon, accentClass }) => (
                    <div
                      key={label}
                      className="flex flex-col rounded-2xl gap-2 bg-[var(--brand-navbar)] p-5 shadow-md backdrop-blur"
                    >
                      <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
                      <div className="flex flex-row items-center gap-3">
                        <span className={`flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <p className="text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
                      </div>
                      
                    </div>
                  ))}
                  <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-5 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Popular regions</p>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)] text-lg text-[var(--brand-text-secondary)]"
                        aria-label="Popular regions actions"
                      >
                        ···
                      </button>
                    </div>
                    <ol className="space-y-2 text-sm text-[var(--brand-text)]">
                      {popularRegions.map((region, index) => (
                        <li
                          key={region}
                          className={`flex items-center py-1 text-base font-medium ${
                            index === popularRegions.length - 1 ? '' : 'border-b border-[var(--brand-border)]'
                          }`}
                        >
                          <span className="w-6 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
                            {index + 1}
                          </span>
                          <span className="ml-3 flex-1">{region}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                
              </div>
            }
          </div>
    </div>
  )
}

export default DetailPageAssets
