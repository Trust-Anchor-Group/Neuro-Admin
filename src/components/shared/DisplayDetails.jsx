import React from 'react';
import { InputField } from '../access/InputField';

export const DisplayDetails = ({ userData,fieldsToShow,title,headTitle }) => {
    if (!userData) return <p>No data available</p>;

  const date = userData.created
    ? new Date(userData.created)
    : null;

  const formattedDate = date
    ? date.toLocaleDateString("sv-SE", {
        hour: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
        minute: "2-digit",
      })
    : "N/A";

    const resolvedData = {
      ...userData,
      created: formattedDate,
    };


  return (
    <div className="max-md:grid-cols-1">
      <div className="bg-white border-2 rounded-xl p-6 pt-8 max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">
          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {userData.account}
            </p>
            {/* {!userData.email && (
              <span className="bg-neuroDarkGray/20 text-neuroDarkGray/70 font-semibold py-1 px-2 rounded-lg">
                No ID
              </span>
            )} */}
          </div>
              {
                headTitle && (
                  <div className='flex border-b-2 pb-5'>
                    <div className='bg-black w-[100px] h-[100px]'></div>
                    <div className=''>
                    <h1>{headTitle.title}</h1>
                    <p>{headTitle.credit}</p>
                    </div>
                    <div className=''>
                    <p>{headTitle.created}</p>
                    <p>{headTitle.tons}</p>
                    </div>
                  </div>
                )
              }
          <div className="bg-neuroGray/70 rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-neuroDarkGray/70 border-b-2 pb-2">
              {title}
            </h2>
            {fieldsToShow?.map((item, key) => {
              return (
                <InputField
                  key={key}
                  labelText={item.label}  
                  name={resolvedData[item.key] || "N/A"} 
                />
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
};
