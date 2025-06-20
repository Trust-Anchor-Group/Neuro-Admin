import React, { useEffect, useState } from 'react'

export const LocalizationSettings = () => {

 const [timezone, setTimezone] = useState('');

  useEffect(() => {
    // Hämta tidszon direkt från browsern
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

  }, []);

  return (
    <div className='grid grid-cols-3 items-center justify-center border-b-2 animate-fade-in'>
        <label className='text-text16 text-neuroTextBlack/65 my-2'>TimeZone:</label>
      <p className='text-text16 max-sm:text-md my-2'>{timezone}</p>
    </div>
  );
}