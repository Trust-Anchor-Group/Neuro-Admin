import React, { useEffect, useState } from 'react'
import { useLanguage, content } from '../../../context/LanguageContext';

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

  const { language } = useLanguage();
  const t = content[language];
  const timezoneLabel = t?.localizationSettings?.timezone || 'Time Zone';

  return (
    <div className='grid grid-cols-3 items-center justify-center border-b-2 border-[var(--brand-border)] animate-fade-in'>
      <label className='text-text16 text-[var(--brand-text-secondary)] my-2'>{timezoneLabel}:</label>
      <p className='text-text16 max-sm:text-md my-2'>{timezone}</p>
      <p className='text-text16 max-sm:text-md my-2'>{currentTime}</p>
    </div>
  );
}