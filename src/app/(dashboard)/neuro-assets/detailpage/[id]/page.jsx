'use client'
import { DisplayDetailsAsset } from '@/components/assets/DisplayDetailsAsset'
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
// Using public logo asset; Next/Image can take a string path referencing /public
import React, { useContext, useMemo } from 'react'
import { FaCertificate, FaChartLine, FaRegFileAlt } from 'react-icons/fa';
import { StatusBox } from '@/components/assets/StatusBox';
import { PartiesBox } from '@/components/assets/PartiesBox';
import Image from 'next/image';
import certificateImage from '../../../../../../public/certificate.jpg'
import { useLanguage } from '../../../../../../context/LanguageContext'
import { PdfButton } from '@/components/assets/PdfButton';
import Process from '@/components/assets/Process';




const DetailPageAssets = () => {



   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'order'

  const { language, content: translations } = useLanguage();
  const t = translations[language];

  const userData = {
    orderName:'Sweden compensation 2024-2025',
    comment:'“Covers all flight C-comp. to and from Sweden”',
    orderType:'CO carbon capture',
    orderQuantity:'73.00 tons',
    orderDate:'2024-02-02, 15:29',
    orderedBy:'EcoTech Solutions',
    created:'2024-02-03, 08:30'
  }

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
    title: 'Q3 Compensation',
    credit: '204-210 EUR',
    created: '2024-02-03',
    tons: '73 tons |230.30 per ton',
    image: '/neuroAdminLogo.svg', // served from public/neuroAdminLogo.svg
  };

  const statusCard = {
    progress:'75',
    amount:'47 tons',
    status:'In progress'
  }  

  const parties = {
    
  }


  return (
    <div className='p-5'>
    <TabNavigation tab={tab} id={id} gridCols={'grid-cols-3'} tabArray={[
      {
        title: t?.assetOrderDetail?.tabs?.order || 'Order detail',
        href:'/neuro-assets/detailpage',
        tabDesination:'order&overview',
        icon:FaRegFileAlt,
        tabRef:'order'
      },
      {   
        title: t?.assetOrderDetail?.tabs?.certificate || 'Certificate',
        href:'/neuro-assets/detailpage',
        tabDesination:'certificate',
        icon:FaCertificate,
        tabRef:'certificate'

      },
          {   
        title: t?.assetOrderDetail?.tabs?.process || 'Process',
        href:'/neuro-assets/detailpage',
        tabDesination:'process',
        icon:FaChartLine,
        tabRef:'process'

      }
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
            />
          </div>
          <div className='col-start-4 col-end-5 flex flex-col items-start gap-2'>
            <StatusBox statusCard={statusCard}/>
            <PartiesBox/>
          </div>
        </div>
        </>
      }
            {
              tab === 'certificate' &&
              <div className='mx-auto w-full h-[60%] border-2 bg-[var(--brand-navbar)] border-[var(--brand-border)] p-5 rounded-lg '>
                <h1 className='font-semibold text-xl mb-5'>
                  {t?.assetOrderDetail?.headings?.orderCertificate || 'Order certificate'}
                </h1>
                <div className='flex flex-row'>
                  <div className='flex w-[50%] flex-col items-start gap-6 bg-[var(--brand-background)] p-5 rounded-lg mr-5'>
                    <h1 className='text-lg font-semibold'>
                      {t?.assetOrderDetail?.headings?.certificateInformation || 'Certificate Information'}
                    </h1>
                    <div className='grid w-full gap-x-10 gap-y-6 text-sm text-[var(--brand-text)] sm:grid-cols-2'>
                      <div className='space-y-5'>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.name || 'NAME'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>Creturner Carbon Credit</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.creator || 'CREATOR'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>2e915fd2-4695-e555-f802-87bbe2cbb750@legal.mateo.lab.tagroot.io</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.category || 'CATEGORY'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>Carbon Offsets</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.visibility || 'VISIBILITY'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>Public</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.updated || 'UPDATED'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>12/16/2024</p>
                        </div>
                      </div>
                      <div className='space-y-5'>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.tokenId || 'TOKEN ID'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>cc71e0cc-78de-4689-828c-aa9e404b1de5@edaler.mateo.lab.tagroot.io</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.owner || 'Owner'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>2eeed87a-e8a8-9a4d-400b-c2f0538661b9@legal.mateo.lab.tagroot.io</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.currency || 'CURRENCY'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>TST</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.created || 'Created'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>12/16/2024 3:25:30 PM</p>
                        </div>
                        <div>
                          <h2 className='text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]'>{t?.assetOrderDetail?.certificateFields?.validUntil || 'VALID UNTIL'}</h2>
                          <p className='mt-1 break-words text-[var(--brand-text)]'>12/16/2029</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-[var(--brand-background)] p-5 rounded-lg w-[50%] flex flex-col items-center'>
                    <Image
                    className='bg-gray-100 p-4 rounded-lg justify-right items-right'
                    src={certificateImage}
                    width={600}
                    height={600}
                    alt='certificate'/>
                  </div>
                </div>
                <PdfButton/>
              </div>
            }
            {
              tab === 'process' &&
              <Process />
            }
          </div>
  
    </div>
                
                

  )
}

export default DetailPageAssets
