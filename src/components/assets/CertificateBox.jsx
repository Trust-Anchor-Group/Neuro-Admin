import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage, content } from '../../../context/LanguageContext';
import certificateImage from '../../../public/certificate.jpg'
import { PdfButton } from '@/components/assets/PdfButton';


// A compact certificate summary card for sidebar usage
export const CertificateBox = ({ certificate }) => {
	const { language } = useLanguage();
	const t = content[language];
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

	return (
    <>
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white">
              <Image
                src={certificateImage}
                alt={t?.assetOrderDetail?.certificateBox?.imageAlt || 'Certificate preview'}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
      <div
        className="shadow-md rounded-xl text-[var(--brand-text)] bg-[var(--brand-navbar)] p-4 w-full max-w-sm flex flex-col gap-3">
        <h2 className="text-lg font-semibold border-b pb-2 border-[var(--brand-border)]">
          {t?.assetOrderDetail?.certificateBox?.title || 'Certificate'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openPreview}
            className="w-full overflow-hidden rounded-xl border border-[var(--brand-border)] bg-gray-100 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            aria-label={t?.assetOrderDetail?.certificateBox?.openPreview || 'Open certificate preview'}
          >
            <Image
              className="rounded-lg"
              src={certificateImage}
              width={300}
              height={300}
              alt={t?.assetOrderDetail?.certificateBox?.imageAlt || 'Certificate preview'}
            />
          </button>
        </div>
        <PdfButton/>
      </div>
    </>
	);
};

export default CertificateBox;
