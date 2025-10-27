import React, { useEffect, useState } from 'react'

export const LocalizationSettings = () => {

 const [timezone, setTimezone] = useState('');
 const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Hämta tidszon direkt från browsern
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='grid grid-cols-3 items-center justify-center border-b-2 border-[var(--brand-border)] animate-fade-in'>
        <label className='text-text16 text-[var(--brand-text-secondary)] my-2'>TimeZone:</label>
      <p className='text-text16 max-sm:text-md my-2'>{timezone}</p>
      <p className='text-text16 max-sm:text-md my-2'>{currentTime}</p>
    </div>
  );
}