import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { DetailpageStatus } from './DetailpageStatus';
import { ActionButtons } from './Buttons/ActionButtons';
import { dateConverter } from '../shared/ConvertDate';
import { InfoToggleButton } from './Buttons/InfoToggleButton';
import { MapOutInput } from '../shared/MapOutInput';
import { PopUpButton } from './Buttons/PopUpButton';
import { ImageComponent } from './ImageComponent';
import { ProfileEditModal } from './ProfileEditModal';

export const Identity = ({
  user, id, getData, fieldsToShow,
  modalToggle, setModalToggle,
  fieldsToShowMetaData
}) => {
  const [infoToggle, setIntoToggle] = useState(true);
  const [infoToggleMetaData, setIntoToggleMetaData] = useState(false);
  const [previewAtt, setPreviewAtt] = useState(null);

  const adminActions = [
    { actionTitle: 'Rejected', bgColor: 'bg-neuroRed/20', icon: FaExclamationTriangle, textColor: 'text-obsoletedRed', name: 'Deny ID application' },
    { actionTitle: 'Approved', bgColor: 'bg-neuroPurpleLight', icon: FaExclamationTriangle, textColor: 'text-neuroPurpleDark', name: 'Approve ID application' },
    { actionTitle: 'Compromised', bgColor: 'bg-neuroDarkOrange/20', icon: FaExclamationTriangle, textColor: 'text-neuroDarkOrange', name: 'Compromise Id' },
    { actionTitle: 'Obsoleted', bgColor: 'bg-obsoletedRed/20', icon: FaExclamationTriangle, textColor: 'text-obsoletedRed', name: 'Obsolete Id' },
];

  if (!user) {
    return (
      <section className="p-3 pb-12">
        <article className="bg-white border-2 rounded-xl p-6 py-12 text-center">
          <p>No available data</p>
        </article>
      </section>
    );
  }

  return (
    <section className="">
      <article
        className="bg-white border-2 rounded-xl shadow-sm p-6 pt-8"
        aria-labelledby="identity-heading"
      >
        {user?.properties?.FIRST ? (
          <div className="grid grid-cols-1 gap-1 h-full max-sm:px-5">
            <header className="flex items-center gap-3 pb-4 max-sm:flex-col max-sm:mt-5">
              <ImageComponent user={user} />
              <div className="flex flex-col pl-2 gap-2 max-md:text-center">
                <DetailpageStatus user={user} adminActions={adminActions} />
                <div>
                  <h1 id="identity-heading" className="text-3xl font-semibold">
                    {user.properties.FIRST + ' ' + user.properties.LAST || 'N/A'}
                  </h1>
                  <p className="text-text16 text-neuroDarkGray/70">
                    {user.account || ''}
                  </p>
                  <div className="border-t-2 pt-2 text-text16 text-neuroDarkGray/70 w-full">
                    {user.state.includes('Created') ? 'Application made ' : 'Registered '}
                    {dateConverter(user.created)}
                  </div>
                </div>
              </div>
            </header>

            <section
              className="bg-neuroGray/70 rounded-xl p-4 overflow-auto"
              aria-labelledby="identity-info-heading"
            >
              <h2 id="identity-info-heading" className="sr-only">Identity Information</h2>
              <InfoToggleButton
                infoToggle={infoToggle}
                setIntoToggle={setIntoToggle}
                title="Identity Information"
              />
              {infoToggle && <MapOutInput fieldsToShow={fieldsToShow} user={user} />}
            </section>

            <section
              className="bg-neuroGray/70 rounded-xl p-4 mt-5 overflow-auto"
              aria-labelledby="identity-meta-heading"
            >
              <h2 id="identity-meta-heading" className="sr-only">Identity Metadata</h2>
              <InfoToggleButton
                infoToggle={infoToggleMetaData}
                setIntoToggle={setIntoToggleMetaData}
                title="Identity metadata"
              />
              {infoToggleMetaData && 
                <MapOutInput fieldsToShow={fieldsToShowMetaData} user={user} />
              }
            </section>

            {user?.attachments?.length > 0 && (
          <section className="bg-white border-2 rounded-xl shadow-sm p-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Attachments</h2>
            <div className="flex flex-wrap gap-4">
              {user.attachments.map((att, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {att.data && att.data.startsWith('/9j/') ? (
                    <button
                      type="button"
                      onClick={() => setPreviewAtt(att)}
                      className="focus:outline-none"
                    >
                      <img
                        src={`data:image/jpeg;base64,${att.data}`}
                        alt={att.fileName || `Attachment ${idx+1}`}
                        className="w-32 h-32 rounded-lg object-cover border hover:ring-2 hover:ring-neuroPurpleDark"
                      />
                    </button>
                  ) : (
                    <a
                      href={`data:application/octet-stream;base64,${att.data}`}
                      download={att.fileName || `Attachment_${idx+1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {att.fileName || `Attachment ${idx+1}`}
                    </a>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{att.fileName}</div>
                </div>
              ))}
            </div>
            {previewAtt && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setPreviewAtt(null)}>
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                  <img
                    src={`data:image/jpeg;base64,${previewAtt.data}`}
                    alt={previewAtt.fileName}
                    className="max-w-full max-h-[80vh] rounded"
                  />
                  <div className="mt-2 text-sm text-gray-700">{previewAtt.fileName}</div>
                  <button className="mt-4 px-4 py-2 bg-neuroPurpleDark text-white rounded" onClick={() => setPreviewAtt(null)}>Close</button>
                </div>
              </div>
            )}
          </section>
        )}

            <footer className="">
              {id ? (
                <ActionButtons
                  user={user}
                  adminActions={adminActions}
                  id={id}
                  getData={getData}
                />
              ) : (
                <PopUpButton
                  title="View more Information"
                  setToggle={setModalToggle}
                  />
              )}
            </footer>

            {modalToggle && user && (
              <ProfileEditModal
                user={user}
                setModalToggle={setModalToggle}
                isEditProfile={true}
              />
            )}
          </div>
        ) : (
          <div className=''>
          <div className="flex flex-col justify-center items-center h-[50vh] max-sm:p-5">
            <FaExclamationTriangle className="size-20 max-sm:size-12" color="orange" />
            <h1 className="text-xl font-semibold max-sm:text-sm">
              Account does not have any ID
            </h1>
            <div className="text-gray-500 text-lg text-center max-sm:text-sm">
              <p>This account doesn't have an identity verification yet.</p>
            </div>
          </div>
          </div>
        )}
      </article>
    </section>
  );
};