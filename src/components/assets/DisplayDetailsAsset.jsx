import React from 'react';
import Image from 'next/image';
import { MapOutInput } from '../shared/MapOutInput';
import { useLanguage, content } from '../../../context/LanguageContext';

export const DisplayDetailsAsset = ({ userData, fieldsToShow, title, header }) => {
  const { language } = useLanguage();
  const t = content[language];

  if (!userData) return <p>{t?.displayDetails?.noData || 'No data available'}</p>;

  return (
    <div className="flex flex-col h-full max-md:grid-cols-1">
      <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-xl shadow-sm p-6 max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
        <div className="grid grid-cols-1 gap-5 max-sm:grid-cols-1 max-sm:px-5">
          <div className="flex justify-between items-center gap-3 max-sm:flex-col max-sm:mt-5">
            <p className="text-text28 font-semibold max-sm:text-xl">
              {userData?.account || userData?.data?.userName}
            </p>
          </div>
          {header && (
            <div className="flex justify-between border-b-2 pb-5">
              <div className="flex gap-10">
                <Image
                  className="w-[100px] h-[100px]"
                  src="/neuroAdminLogo.svg"
                  width={120}
                  height={120}
                  unoptimized
                  alt="neuroAdminLogo.svg"
                />
                <div>
                  <h1 className="text-2xl font-semibold">{header.title}</h1>
                  <p className="text16 text-[var(--brand-text)]">{header.created}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-[var(--brand-background)] rounded-xl p-5">
            <h1 className="text-lg font-semibold text-[var(--brand-text)]">
              {t?.displayDetails?.certificateTitle || 'Certificate Information'}
            </h1>
            <p className="text-sm text-[var(--brand-text-secondary)]">
              {t?.displayDetails?.certificateDescription ||
                'The token validates the process of a tokenized Carbon Emissions Offset. The owner purchases the Carbon Token from Creturner which offsets a specific amount of CO2e.'}
            </p>
          </div>
          <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
              {title}
            </h2>
            <MapOutInput fieldsToShow={fieldsToShow} user={userData} />
          </div>
        </div>
      </div>
    </div>
  );
};

