'use client'
import { DisplayDetails } from '@/components/access/Buttons/DisplayDetails'
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
            <DisplayDetails
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
                  <div className='flex justify-left items-left w-[50%]'>
                    <h1 className='text-lg font-semibold'>
                      {t?.assetOrderDetail?.headings?.certificateInformation || 'Certificate Information'}
                    </h1>
                  </div>
                  <Image
                  className='bg-gray-100 p-4 rounded-lg justify-right items-right'
                  src={certificateImage}
                  width={600}
                  height={600}
                  alt='certificate'/>
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
