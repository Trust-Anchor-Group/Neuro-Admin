import React from 'react'
import { InputField } from './InputField';


export const AccountDetails = ({user}) => {

    const createdTimestamp = user?.data?.account?.created || user?.data?.created

  
    const date = new Date(createdTimestamp * 1000)
    const formattedDate = date.toLocaleDateString("sv-SE", {
        hour: "2-digit",
        year: "numeric",
        month: "short",
      day: "numeric",
      minute: "2-digit",
    });


  return (
    <div className='max-md:grid-cols-1'>
    <div className='bg-white border-2 rounded-xl p-6 pt-8  max-md:col-span-1 max-sm:p-0
    max-sm:pb-5 max-sm:overflow-auto'>
        {
           user?.data?.properties ? (
                <div className=''>
                    <div className='grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5'>
                        <div className='flex justify-between items-center gap-3 border-b-2 pb-4 max-sm:flex-col max-sm:mt-5'>

                       
                          
                                <p className='text-text28 font-semibold max-sm:text-xl'>{user.data.account || 'N/A'}</p>
                                <p>{user.data.properties.FIRST ? '' : <span className='bg-neuroDarkGray/20 text-neuroDarkGray/70 font-semibold py-1 px-2 rounded-lg'>No ID</span>}</p>
                            
                        </div>
                        <div className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
                            <h2 className='font-semibold text-neuroDarkGray/70'>Account Information</h2>
                            <InputField labelText={'Account'} name={user.data.account || 'N/A'}/>
                            <InputField labelText={'Location'} name={user.data.properties.COUNTRY || 'N/A'}/>
                            <InputField labelText={'Email'} name={user.data.properties.EMAIL || 'N/A'}/>
                            <InputField labelText={'Phone Number'} name={user.data.properties.PHONE || 'N/A'}/>
                            <InputField labelText={'Created'} name={formattedDate || 'N/A'}/>
                        </div>
                    </div>
                </div> 
            ) : (
                <div className=''>
                <div className='grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5'>
                    <div className='flex justify-between items-center gap-3 border-b-2 pb-4 max-sm:flex-col max-sm:mt-5'>

                   
                      
                            <p className='text-text28 font-semibold max-sm:text-xl'>{user.data.account.userName || 'N/A'}</p>
                        
                    </div>
                    <div className='bg-neuroGray/70 rounded-xl p-5 overflow-auto'>
                        <h2 className='font-semibold text-neuroDarkGray/70'>Account Information</h2>
                        <InputField labelText={'Account'} name={user.data.account.userName || 'N/A'}/>
                        <InputField labelText={'Email'} name={user.data.account.eMail || 'N/A'}/>
                        <InputField labelText={'Phone Number'} name={user.data.account.phoneNr || 'N/A'}/>
                        <InputField labelText={'Created'} name={formattedDate || 'N/A'}/>
                    </div>
                </div>
            </div> 
            )
            
        }
    </div>
              
   
</div>
  )
}

  