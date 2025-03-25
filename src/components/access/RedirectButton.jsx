'use client'
import React, {  useState, } from 'react'


export const RedirectButton = ({classText,buttonName }) => {
 //Send id and a href to redirect to another page
 //If using a hamburgMeny, write hambrugMeny = true. 
 //You can use this component just as a button to just redirect back(without id)

  const [toggle, setToggle] = useState(false)
  
  function handleToggle() {
    setToggle((prev) => !prev)
  }

  return (
    <>
        
          <button className={classText}>{buttonName}</button>
        
    </>
  )
}
