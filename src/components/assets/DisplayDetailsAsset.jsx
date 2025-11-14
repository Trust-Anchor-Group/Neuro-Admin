import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { MapOutInput } from '../shared/MapOutInput';
import { useLanguage, content } from '../../../context/LanguageContext';

const PLACEHOLDER_IMAGES = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  label: '[ IMAGE ]',
}));

// Added optional props: extraData, extraFields, extraTitle to render a second information block
export const DisplayDetailsAsset = ({
  userData,
  fieldsToShow,
  title,
  header,
  extraData,
  extraFields,
  extraTitle,
  // Pricing block props
  extraPrice,
  priceFields,
  priceTitle,
  // Company info block props
  extraCompany,
  companyFields,
  companyTitle,
}) => {
  const { language } = useLanguage();
  const t = content[language];
  const [selectedImage, setSelectedImage] = useState(null);
  const placeholders = useMemo(() => PLACEHOLDER_IMAGES, []);

  if (!userData) return <p>{t?.displayDetails?.noData || 'No data available'}</p>;

  const openPreview = (image) => setSelectedImage(image);
  const closePreview = () => setSelectedImage(null);

  return (
    <div className="flex flex-col h-full max-md:grid-cols-1">
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border border-[var(--brand-border)] bg-gradient-to-br from-[#B3B6B8] to-[#9A9A9A] text-xl font-semibold text-[var(--brand-text-secondary)] tracking-[0.35em]">
              {selectedImage?.label}
            </div>
          </div>
        </div>
      )}
      <div className="max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">
          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {userData?.account || userData?.data?.userName}
            </p>
          </div>
          {header && (
            <div className='flex flex-col justify-between p-5 bg-[var(--brand-navbar)] shadow-md rounded-xl'>
              <div className="flex justify-between p-5">
                <div className="flex gap-10 w-full">
                  <Image
                    className="w-[100px] h-[100px]"
                    src="/neuroAdminLogo.svg"
                    width={120}
                    height={120}
                    unoptimized
                    alt="neuroAdminLogo.svg"
                  />
                  <div className='border-b border-[var(--brand-border)] w-full'>
                    <h1 className="text-2xl font-semibold">{header.title}-{header.created} </h1>
                    <p className="text16 text-[var(--brand-text)]">{header.issuer}</p>
                  </div>
                </div>
              </div>
                <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {placeholders.map((image) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => openPreview(image)}
                      className="group relative flex h-40 w-full items-center justify-center rounded-md bg-gradient-to-br from-[#B3B6B8] to-[#9A9A9A] text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-lg"
                      aria-label={`${t?.displayDetails?.openPreview || 'Open preview'} ${image.id}`}
                    >
                      {image.label}
                    </button>
                  ))}
                </div>
              <div className='bg-[var(--brand-background)] rounded-xl p-5 overflow-auto'>
                <h1 className="text-lg font-semibold text-[var(--brand-text)] border-b border-[var(--brand-border)] pb-2 mb-3">
                  {t?.displayDetails?.certificateTitle || 'Description'}
                </h1>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  {t?.displayDetails?.certificateDescription ||
                    'The token validates the process of a tokenized Carbon Emissions Offset. The owner purchases the Carbon Token from Creturner which offsets a specific amount of CO2e.'}
                </p>
              </div>
            </div>  
          )}
          <div className="bg-[var(--brand-navbar)] rounded-xl p-5 shadow-md">
            <div className="mb-5 border-b border-[var(--brand-border)] pb-3">
              <h1 className="text-base text-[var(--brand-text-secondary)] font-semibold mb-2">
                {t?.displayDetails?.assetType || 'Asset Type'}
              </h1>
              <p className="text-xl font-bold text-[var(--brand-text)]">
                {t?.displayDetails?.coffeeBean || 'Coffee bean'}
              </p>
            </div>
            <div className='bg-[var(--brand-background)] rounded-xl p-5 overflow-auto'>
              <h1 className="text-lg font-semibold text-[var(--brand-text)] border-b border-[var(--brand-border)] pb-2 mb-3">
                {t?.displayDetails?.certificateTitle || 'Description'}
              </h1>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {t?.displayDetails?.certificateDescription ||
                  'The token validates the process of a tokenized Carbon Emissions Offset. The owner purchases the Carbon Token from Creturner which offsets a specific amount of CO2e.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5 p-5 bg-[var(--brand-navbar)] rounded-xl shadow-md">
            <Image
              className='mb-5 w-full h-auto rounded-xl border border-[var(--brand-border)]'
              src='/brazilMap.svg'
              width={800}
              height={450}
              alt={t?.displayDetails?.brazilMapAlt || 'Brazil production map'}
              priority
            />

            <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
              <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
                {title}
              </h2>
              <MapOutInput fieldsToShow={fieldsToShow} user={userData} />
            </div>
            {extraData && (
              <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
                <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
                  {extraTitle || t?.displayDetails?.extraTitle || 'Production process'}
                </h2>
                <MapOutInput fieldsToShow={extraFields || fieldsToShow} user={extraData} />
              </div>
            )}
            {extraPrice && (
              <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
                <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
                  {priceTitle || t?.displayDetails?.priceTitle || 'Pricing Information'}
                </h2>
                <MapOutInput fieldsToShow={priceFields || fieldsToShow} user={extraPrice} />
              </div>
            )}
            {extraCompany && (
              <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
                <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
                  {companyTitle || t?.displayDetails?.companyTitle || 'Company Information'}
                </h2>
                <MapOutInput fieldsToShow={companyFields || fieldsToShow} user={extraCompany} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
