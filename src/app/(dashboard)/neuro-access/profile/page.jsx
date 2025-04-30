'use client'
import { AccountDetails } from '@/components/shared/AccountDetails'
import { CreateUserData } from '@/components/shared/CreateUserData'
import config from '@/config/config'
import React, { useEffect, useState } from 'react'

const ProfilePage = () => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchUserImage = async (legalId) => {
        try {
          const response = await fetch("/api/legalIdPicture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ legalId }),
          });
      
          if (!response.ok) throw new Error("Failed to fetch user image");
      
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error("Error fetching user image:", error);
          return null;
        }
      };

     useEffect(() => {
      const storedUser = sessionStorage.getItem("neuroUser");
      console.log('stored User ID',storedUser)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
       
        setUser({
            name:parsedUser.name,
            account:'Vince',
            email:'vince@domain.com',
            phone:'10293810239',
            country:'SE',
            created:'',
        })
 
      }
    }, []);

    const fieldsToShow = [
      { label: "Full name", key: "name" },
      { label: "Account", key: "account" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Location", key: "country" },
      { label: "Created", key: "created" }
    ];
  
    // Logga fieldsToShow för att kontrollera om strukturen är korrekt
    console.log('fieldsToShow:', fieldsToShow);


  return (
    <div className='relative p-5'>
        <AccountDetails 
          fieldsToShow={fieldsToShow}
        userData={CreateUserData(user)}/>
             {loading && (
                  <div className="absolute inset-0 bg-white/50  flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-4xl text-gray-500" />
                  </div>
        )}
    </div>
  )
}

export default ProfilePage