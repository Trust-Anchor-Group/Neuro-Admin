'use client'
import { DisplayDetails } from '@/components/access/Buttons/DisplayDetails'
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
import imageLogoExample from '@/app/(dashboard)/neuro-assets/neuroAdminLogo.svg'
import React from 'react'
import { FaCertificate, FaChartLine, FaRegFileAlt } from 'react-icons/fa';
import { StatusBox } from '@/components/assets/StatusBox';
import { PartiesBox } from '@/components/assets/PartiesBox';
import Image from 'next/image';
import certificateImage from '../../../../../../public/certificate.jpg'
import { PdfButton } from '@/components/assets/PdfButton';
import Process from '@/components/assets/Process';




const DetailPageAssets = () => {



   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'order'

  const userData = {
    orderName:'Sweden compensation 2024-2025',
    comment:'“Covers all flight C-comp. to and from Sweden”',
    orderType:'CO carbon capture',
    orderQuantity:'73.00 tons',
    orderDate:'2024-02-02, 15:29',
    orderedBy:'EcoTech Solutions',
    created:'2024-02-03, 08:30'
  }

  const fieldsToShow = [
    { label: "Order Name", key: "orderName" },
    { label: "Comment", key: "comment" },
    { label: "Order type", key: "orderType" },
    { label: "Order Quantity", key: "orderQuantity" },
    { label: "Order Date", key: "orderDate" },
    { label: "Ordered By", key: "orderedBy" },
    { label: "Created", key: "created" },
  ];

  const headTitle = {
      title:'Q3 Compensation',
      credit:'204-210 EUR',
      created:'2024-02-03',
      tons:'73 tons |230.30 per ton',
      image:imageLogoExample,
    }

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
              title:'Order\u00A0overview',
              href:'/neuro-assets/detailpage',
              tabDesination:'order&overview',
              icon:FaRegFileAlt,
              tabRef:'order'
          },
          {   
              title:'Identity',
              href:'/neuro-assets/detailpage',
              tabDesination:'certificate',
              icon:FaCertificate,
              tabRef:'certificate'

          },
                    {   
              title:'Process',
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
        <div className='grid grid-cols-4 grid-rows-4 gap-5'>
          <div className='col-span-3 row-span-4'>
          <DisplayDetails
          fieldsToShow={fieldsToShow}
          userData={userData}
          title={'Order details'}
          header={headTitle}/>
         </div>
      
             <div className='col-start-4 col-end-5'>
            <StatusBox statusCard={statusCard}/>
            </div> 
            <div className='col-start-4 col-end-5 row-start-2 row-end-4'>
             <PartiesBox/>
            </div>


        </div>
        </>
      }
            {
              tab === 'certificate' &&
              <div className='mx-auto w-full h-[60%] border-2 bg-[var(--brand-navbar)] border-[var(--brand-border)] p-5 rounded-lg '>
                <h1 className='font-semibold text-xl mb-5'>Order certificate</h1>
                <Image
                className='bg-gray-100 p-4 rounded-lg justify-center items-center mx-auto'
                src={certificateImage}
                width='full'
                height={1200}
                alt='certificate'/>
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
