"use client";
import React from 'react';
import { Button } from '../shared/Button';
import { FaDownload, FaShare } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const PdfButton = () => {
  const { language, content } = useLanguage();
  const t = content?.[language]?.certificateButtons || {};
  return (
    <div className='mt-5 flex justify-end gap-5'>
      <div>
        <Button
          buttonIcon={<FaDownload />}
          buttonName={t.download || 'Download certificate'}
          textColor={'text-white'}
          bgColor={'bg-[var(--brand-primary)]'}
        />
      </div>
      <div>
        <Button
          buttonIcon={<FaShare />}
          buttonName={t.share || 'Share certificate'}
          textColor={'text-white'}
          bgColor={'bg-[var(--brand-primary)]'}
        />
      </div>
    </div>
  );
};
