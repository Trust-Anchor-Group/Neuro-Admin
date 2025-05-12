import React from 'react';
import { InputField } from '../access/InputField';
import imageLogoExample from '@/app/(dashboard)/neuro-assets/neuroAdminLogo.svg'
import Image from 'next/image';
import { dateConverter } from './ConvertDate';

export const DisplayDetails = ({ userData,fieldsToShow,title,headTitle }) => {
    if (!userData) return <p>No data available</p>;


  return (
    <div className="max-md:grid-cols-1">
      <div className="bg-white border-2 rounded-xl p-6 max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">
          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {userData.account}
            </p>
          </div>
              {
                headTitle && (
                  <div className='flex justify-between border-b-2 pb-5'>
                        <div className='flex gap-10'>
                            <Image
                            className='w-[100px] h-[100px]'
                            src={imageLogoExample}
                            width={1200}
                            height={1200}
                            alt='Logo'/>
                            <div className=''>
                            <h1 className=' text-2xl font-semibold' >{headTitle.title}</h1>
                            <p className='text16 text-neuroTextBlack/65'>{headTitle.created}</p>
                            </div>
                        </div>
                    <div className=''>
                    <p className='text-2xl font-semibold '>{headTitle.credit}</p>
                    <p className='text16 text-neuroTextBlack/65'>{headTitle.tons}</p>
                    </div>
                  </div>
                )
              }
          <div className="bg-neuroGray/70 rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-neuroDarkGray/70 border-b-2 pb-2">
              {title}
            </h2>
            {fieldsToShow?.map((item, key) => {
              //Make "properties.EMAIL" Work
              let value = item.key.split('.').reduce((obj, keyPart) => obj && obj[keyPart], userData);
              //Check Date and make the date to the right format
   
                let unixTimestamp = null;
                if (item.key.includes('created')) {
                    unixTimestamp = value; 
                }
            
                const formattedDate = unixTimestamp ? dateConverter(unixTimestamp) : null;
              return (
                <InputField
                  key={key}
                  labelText={item.label}
                  name={formattedDate || value || "N/A"} 
                />
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
};
