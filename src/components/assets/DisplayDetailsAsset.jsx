import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapOutInput } from '../shared/MapOutInput';
import { useLanguage, content } from '../../../context/LanguageContext';

export const DisplayDetailsAsset = ({ userData, fieldsToShow, title, header }) => {
  const { language } = useLanguage();
  const t = content[language];
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      let objBody
      if (userData.data === undefined) {
        objBody = { accountName: userData.account };
      } else {
        objBody = { accountName: userData.data.userName };
      }
      const res = await fetch('/api/deleteAccount', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(objBody),
      });

      if (res.ok) {
        setShowConfirmPopup(false);
        setShowDeletedMessage(true);
        // Optionally, redirect after a delay:
        setTimeout(() => router.push('/neuro-access/account'), 1300);
      } else {
        const errorText = await res.text();
        alert(`Failed to delete account: ${errorText || res.statusText}`);
      }
    } catch (err) {
      alert(`An error occurred: ${err.message}`);
    }
  };

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
          {
            header && (
              <div className='flex justify-between border-b-2 pb-5'>
                <div className='flex gap-10'>
                  <Image
                    className='w-[100px] h-[100px]'
                    src='/neuroAdminLogo.svg'
                    width={120}
                    height={120}
                    unoptimized
                    alt='neuroAdminLogo.svg'/>
                  <div className=''>
                    <h1 className=' text-2xl font-semibold' >{header.title}</h1>
                    <p className='text16 text-[var(--brand-text)]'>{header.created}</p>
                  </div>
                </div>
                <div className=''>
                  <p className='text-2xl font-semibold '>{header.credit}</p>
                  <p className='text16 text-[var(--brand-text)]'>{header.tons}</p>
                </div>
              </div>
            )
          }
          <div className='bg-[var(--brand-background)] rounded-xl p-5'>
            <h1 className='text-lg font-semibold text-[var(--brand-text)]'>
              {t?.displayDetails?.certificateTitle || 'Certificate Information'}
            </h1>
            <p className='text-sm text-[var(--brand-text-secondary)]'>
              {t?.displayDetails?.certificateDescription || 'The token validates the process of a tokenized Carbon Emissions Offset. The owner purchases the Carbon Token from Creturner which offsets a specific amount of CO₂e.'}
            </p>
          </div>
          <div className="bg-[var(--brand-background)] rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)] pb-2">
              {title}
            </h2>
            <MapOutInput fieldsToShow={fieldsToShow} user={userData} />
          </div>
          <button
            onClick={() => setShowConfirmPopup(true)}
            className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl text-xl shadow-lg transition-colors"
          >
            {t?.displayDetails?.cancelOrder || 'Cancel Order'}
          </button>
        </div>
      </div>
      {showConfirmPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-black/40 px-4">
          <div className="relative bg-white rounded-lg border border-gray-200 w-[90%] max-w-md p-6 text-center">
            <button
              onClick={() => setShowConfirmPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {t?.displayDetails?.confirmTitle || 'Are you sure you want to delete your account?'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t?.displayDetails?.confirmSubtitle || 'This action cannot be undone.'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:opacity-80 transition"
              >
                {t?.displayDetails?.confirmDelete || 'Delete'}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:opacity-80 transition"
              >
                {t?.displayDetails?.cancel || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeletedMessage && (
        <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <p className="text-2xl font-semibold text-gray-800">
              {t?.displayDetails?.deletedMessage || 'Your account has been successfully deleted.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


