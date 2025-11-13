"use client";
import React from 'react';
import { Button } from '../shared/Button';
import { FaDownload, FaShare } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const PdfButton = () => {
  const { language, content } = useLanguage();
  const t = content?.[language]?.certificateButtons || {};
  return (
    <div className='flex justify-end gap-5'>
      <div className='text-base text-[#9333EA] bg-[rgba(143,64,212,0.15)] rounded-lg w-[50%] flex items-center justify-center'>
        <Button
          buttonIcon={<FaDownload />}
          buttonName={t.download || 'Download'}
        />
      </div>
      <div className='text-base text-[#9333EA] bg-[rgba(143,64,212,0.15)] rounded-lg w-[50%] flex items-center justify-center'>
        <Button
          buttonIcon={<FaShare />}
          buttonName={t.share || 'Share'}
        />
      </div>
    </div>
  );
};
