import React from 'react'
import { Button } from '../shared/Button'
import { FaDownload } from 'react-icons/fa'

export const PdfButton = () => {
  return (
    <div className='grid grid-cols-4 mt-5'>
      <div className='col-start-3 col-end-4'>
        <Button 
        buttonIcon={<FaDownload/>} 
        buttonName={'Download\u00A0certificate'}
        textColor={'text-neuroPurpleDark'}
        bgColor={'bg-neuroPurpleLight/60'}/>
      </div>
      <div>
        <Button 
        buttonIcon={<FaDownload/>} 
        buttonName={'Download\u00A0certificate'}
        textColor={'text-neuroPurpleDark'}
        bgColor={'bg-neuroPurpleLight/60'}/>
        </div>
    </div>
  )
}
