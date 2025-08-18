import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { MapOutInput } from '../../shared/MapOutInput';

export const DisplayDetails = ({ userData, fieldsToShow, title, header }) => {
  if (!userData) return <p>No data available</p>;
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        const objBody = { accountName: userData.data.userName };
        const res = await fetch('/api/deleteAccount', {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(objBody),
        });

        if (res.ok) {
          alert('Your account has been successfully deleted.');
          router.push('/landingpage')

        } else {
          const errorText = await res.text();
          alert(`Failed to delete account: ${errorText || res.statusText}`);
        }
      } catch (err) {
        alert(`An error occurred: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-md:grid-cols-1">
      <div className="bg-white border rounded-xl shadow-sm p-6 max-md:col-span-1 max-sm:p-0 max-sm:pb-5 max-sm:overflow-auto">
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
                    src={header.image}
                    width={1200}
                    height={1200}
                    alt='Logo' />
                  <div className=''>
                    <h1 className=' text-2xl font-semibold' >{header.title}</h1>
                    <p className='text16 text-neuroTextBlack/65'>{header.created}</p>
                  </div>
                </div>
                <div className=''>
                  <p className='text-2xl font-semibold '>{header.credit}</p>
                  <p className='text16 text-neuroTextBlack/65'>{header.tons}</p>
                </div>
              </div>
            )
          }
          <div className="bg-neuroGray/70 rounded-xl p-5 overflow-auto">
            <h2 className="font-semibold text-neuroDarkGray/70 border-b-2 pb-2">
              {title}
            </h2>
            <MapOutInput fieldsToShow={fieldsToShow} user={userData} />
            <button
              onClick={handleDeleteAccount}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
