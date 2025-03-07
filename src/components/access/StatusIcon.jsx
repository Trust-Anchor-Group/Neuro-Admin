import React from 'react'

export const StatusIcon = ({ icon, text, color,bgColor}) => {

  return (
    <div className={`flex ${bgColor} p-1 rounded-full gap-3 justify-center items-center max-md:grid-cols-1`}>
    <span className={`z-10 rounded-full bg-white border-2`}>{icon}</span>
    <span className={`text-white hidden md:inline`}>{text}</span>
  </div>
  )
}
