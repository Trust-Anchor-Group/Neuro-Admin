import React from 'react'

export const StatusIcon = ({ icon, text, color}) => {
  return (
    <div className="flex gap-3 justify-center items-center max-md:grid-cols-1">
    {icon}
    <span className={`${color} hidden md:inline`}>{text}</span>
  </div>
  )
}
