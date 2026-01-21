import React, { useState } from 'react';
import Image from 'next/image';
import { MapOutInput } from '../shared/MapOutInput';
import { useLanguage, content } from '../../../context/LanguageContext'; 

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
  // New props for dynamic content
  descriptionTitle,
  descriptionText,
  images = [] // Array of image strings from JSON
}) => {
  const { language } = useLanguage();
  const t = content[language];
  const [selectedImage, setSelectedImage] = useState(null);

  if (!userData) return <p>{t?.displayDetails?.noData || 'No data available'}</p>;

  const openPreview = (image) => setSelectedImage(image);
  const closePreview = () => setSelectedImage(null);

  // Helper to resolve image paths (assuming images are in public root or a specific folder)
  // If your images are in public/images/, change the return to `/images/${src}`
  const getImagePath = (src) => src.startsWith('/') ? src : `/${src}`;

  return (
    <div className="flex flex-col h-full max-md:grid-cols-1">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImagePath(selectedImage)}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      <div className="max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">

          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {/* Fallback to header title if userData.account is missing */}
              {userData?.account || header?.title}
            </p>
          </div>

          {/* Header Block with Logo and Gallery */}
          {header && (
            <div className='flex flex-col justify-between p-5 bg-[var(--brand-navbar)] shadow-md rounded-xl'>
              <div className="flex justify-between p-5 border-b border-[var(--brand-border)]">
                <div className="flex gap-10 w-full items-center">
                  {/* Logo */}
                  {header.image && (
                    <div className="relative w-[100px] h-[100px] flex-shrink-0">
                      <Image
                        className="rounded-full object-cover"
                        src={getImagePath(header.image)}
                        fill
                        unoptimized
                        alt="Project Logo"
                      />
                    </div>
                  )}
                  <div className='w-full'>
                    <h1 className="text-2xl font-semibold">{header.title}</h1>
                    <p className="text-lg text-[var(--brand-text-secondary)]">{header.issuer}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--brand-accent)] text-[var(--brand-primary)]">
                        {header.tons}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Image Gallery */}
              {images && images.length > 0 ? (
                <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {images.map((imgName, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => openPreview(imgName)}
                      className="group relative flex h-32 w-full items-center justify-center rounded-md overflow-hidden border border-[var(--brand-border)] hover:opacity-80 transition-all"
                    >
                      <Image
                        src={getImagePath(imgName)}
                        alt={`Gallery ${index}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-[var(--brand-text-secondary)]">No images available</p>
              )}

              {/* Intro Text */}
              <div className='bg-[var(--brand-background)] rounded-xl p-5 overflow-auto mt-2'>
                <h1 className="text-lg font-semibold text-[var(--brand-text)] border-b border-[var(--brand-border)] pb-2 mb-3">
                  {descriptionTitle || t?.displayDetails?.certificateTitle || 'Description'}
                </h1>
                <p className="text-sm text-[var(--brand-text-secondary)] whitespace-pre-line">
                  {descriptionText || t?.displayDetails?.certificateDescription || 'No description available.'}
                </p>
              </div>
            </div>
          )}

          {/* Asset Type Block */}
          <div className="bg-[var(--brand-navbar)] rounded-xl p-5 shadow-md">
            <div className="mb-5 border-b border-[var(--brand-border)] pb-3">
              <h1 className="text-base text-[var(--brand-text-secondary)] font-semibold mb-2">
                {t?.displayDetails?.assetType || 'Asset Category'}
              </h1>
              <p className="text-xl font-bold text-[var(--brand-text)]">
                {/* Display Categories from props or default */}
                {header?.categories?.join(', ') || 'Coffee Bean'}
              </p>
            </div>
          </div>

          {/* Data Fields Blocks */}
          <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5 p-5 bg-[var(--brand-navbar)] rounded-xl shadow-md">

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