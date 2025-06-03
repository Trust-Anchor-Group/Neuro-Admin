import React from 'react'
import { InputField } from '../access/InputField';
import { dateConverter } from './ConvertDate';

export const MapOutInput = ({fieldsToShow,user}) => {
  console.log('Field to Show',fieldsToShow)

  if (!fieldsToShow || !Array.isArray(fieldsToShow)) {
  console.warn('fieldsToShow is missing or not an array:', fieldsToShow);
  return null;
}

  return (
    <div>
        {
        fieldsToShow?.map((item, key) => {
         //Make "properties.EMAIL" Work
        let value = item.key.split('.').reduce((obj, keyPart) => obj && obj[keyPart], user);
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
  )
}
