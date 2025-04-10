import React from 'react'

export const StatusIcon = ({ icon, text,color,bgColor}) => {

  return (
    <div className={`inline-block px-2  ${bgColor} rounded-md`}>
    <span className={`hidden font-semibold ${color} md:inline`}>{text}</span>
  </div>
  )
}
