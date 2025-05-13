import { DisplayDetails } from '@/components/access/Buttons/DisplayDetails'
import React from 'react'

const DetailPageAssets = () => {

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
    }


  return (
    <div className='p-5'>
      <DisplayDetails
        fieldsToShow={fieldsToShow}
        userData={userData}
        title={'Order details'}
        headTitle={headTitle}/>
    </div>
  )
}

export default DetailPageAssets