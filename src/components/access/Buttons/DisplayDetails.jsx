import React from 'react';
import Image from 'next/image';
import { MapOutInput } from '../../shared/MapOutInput';

export const DisplayDetails = ({ userData,fieldsToShow,title,header }) => {
    if (!userData) return <p>No data available</p>;


  return (
    <div className="flex flex-col h-full max-md:grid-cols-1">
      <div className="bg-white border rounded-xl shadow-sm p-6 max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">
          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {userData?.account || userData?.data?.userName}
            </p>
          </div>
              {
                header && (
                  <div className='flex justify-between border-b-2 pb-5'>
                        <div className='flex gap-10'>
                            <Image
                            className='w-[100px] h-[100px]'
                            src={header.image}
                            width={1200}
                            height={1200}
                            alt='Logo'/>
                            <div className=''>
                            <h1 className=' text-2xl font-semibold' >{header.title}</h1>
                            <p className='text16 text-neuroTextBlack/65'>{header.created}</p>
                            </div>
                        </div>
                    <div className=''>
                    <p className='text-2xl font-semibold '>{header.credit}</p>
                    <p className='text16 text-neuroTextBlack/65'>{header.tons}</p>
                    </div>
                  </div>
                )
              }
          <div className="bg-neuroGray/70 rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-neuroDarkGray/70 border-b-2 pb-2">
              {title}
            </h2>
              <MapOutInput fieldsToShow={fieldsToShow} user={userData}/>
          </div>
        </div>
      </div>
    </div>
  );
};
