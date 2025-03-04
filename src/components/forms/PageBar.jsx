import React from 'react'

export const PageBar = ({title,currentSlide,totalSlides}) => {

    const prgressPercentage = (currentSlide/totalSlides * 100)

  return (
    <div className='flex justify-between items-center'>
        <span className='font-semibold text-lg border-2 p-5 rounded-md bg-neuroGray'>{title}</span>

        <div className='w-[50%] h-5 bg-gray-300 rounded-full overflow-hidden'>
            <div className='h-full bg-blue-500 transition-all duration-300'
            style={{width:`${prgressPercentage}%`}}
            >
                
            </div>
        </div>
        <div className=''>
            <span className='text-lg'>{`Step ${currentSlide}/${totalSlides}`}</span>
        </div>
    </div>
    
  )
}
