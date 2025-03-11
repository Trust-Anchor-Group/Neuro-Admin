import React from 'react'

export const StatusIcon = ({ icon, text,color,bgColor}) => {

  return (
    <div className={`grid grid-cols-2 ${bgColor} pr-10 rounded-full justify-center items-center max-md:grid-cols-1`}>
    <span className={`z-10 pl-[50%]`}>{icon}</span>
    <span className={`hidden md:inline`}>{text}</span>
  </div>
  )
}
