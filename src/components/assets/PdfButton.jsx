import React from 'react'
import { Button } from '../shared/Button'
import { FaDownload, FaShare } from 'react-icons/fa'

export const PdfButton = () => {
  return (
    <div className='mt-5 flex justify-end gap-5'>
      <div>
        <Button 
        buttonIcon={<FaDownload/>} 
        buttonName={'Download\u00A0certificate'}
        textColor={'text-neuroPurpleLight'}
        bgColor={'bg-[var(--brand-primary)]'}/>
      </div>
      <div>
        <Button 
        buttonIcon={<FaShare/>} 
        buttonName={'Share\u00A0certificate'}
        textColor={'text-neuroPurpleLight'}
        bgColor={'bg-[var(--brand-primary)]'}/>
        </div>
    </div>
  )
}
