import React from 'react'

export const ButtonForm = ({bgColor,buttonText,handleSlide,handleSlideProp,textColor}) => {
  return (
    <button onClick={() => handleSlide(handleSlideProp)} className={`${textColor} ${bgColor}
     p-4 rounded-lg w-32 font-semibold transition-opacity hover:opacity-50`}>
        {buttonText}
    </button>
  )
}
