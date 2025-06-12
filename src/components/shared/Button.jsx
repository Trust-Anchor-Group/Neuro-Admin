import React from 'react'

export const Button = ({buttonName,textColor,bgColor,buttonIcon}) => {
  return (
    <button className={`${textColor} ${bgColor} shadow-sm  p-2 flex justify-center items-center font-semibold gap-2
     rounded-lg cursor-pointer transition-opacity hover:opacity-70`}>
        {buttonIcon}
        {buttonName}
    </button>
  )
}
