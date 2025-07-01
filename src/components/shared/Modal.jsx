'use client'

import React, { useState } from 'react'
import { FaSpinner, FaTimes } from 'react-icons/fa'
import { ImageViewerModal } from './ImageViewerModal'
import { TiptapEditor } from './TiptapEditor'

export const Modal = ({ setToggle, loading, user, text, handleApprove, handleReject }) => {
  const [showFinalConfirmPopup, setShowFinalConfirmPopup] = useState(false)
  const [denialMode, setDenialMode] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const imageList = user.attachments?.filter(a => a?.data) || []

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      setToggle(false);
    }
  }

  return (
    <div 
    className="fixed inset-0 flex justify-center items-center z-50 bg-black/30"
    onClick={handleOverlayClick}
    >
      <div className="relative bg-white rounded-lg border border-gray-200 w-full max-w-2xl p-6 overflow-y-auto max-h-screen sm:max-h-[90vh]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </div>
        )}

        <button
          onClick={() => setToggle(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>

        <header className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Review ID application</h2>
        </header>

        <div className="text-sm font-bold mb-2">Applicant photo</div>
        <div className="flex mb-6">
          {user?.attachments?.[2]?.data ? (
            <div
              className="w-32 h-32 rounded-lg overflow-hidden border cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(2)
                setViewerOpen(true)
              }}
            >
              <img
                src={`data:image/jpeg;base64,${user.attachments[2].data}`}
                alt={user.attachments[2].fileName || 'Applicant Photo'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-sm text-gray-500 border">
              No photo
            </div>
          )}
        </div>

        <div className="text-sm font-bold">Applicant identification</div>
        <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
          <div className="text-sm font-bold text-gray-500 mb-3">Identification chosen</div>
          <div className="border-t border-gray-200 pt-2 text-base text-gray-700">National ID card</div>
        </div>

        <div className="flex gap-4 mb-6">
          {[0, 1].map(index => (
            <div
              key={index}
              className="w-[194px] h-[144px] border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(index)
                setViewerOpen(true)
              }}
            >
              {user?.attachments?.[index]?.data ? (
                <img
                  src={`data:image/jpeg;base64,${user.attachments[index].data}`}
                  alt={user.attachments[index].fileName || `ID ${index === 1 ? 'Front' : 'Back'}`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-500 text-sm">
                  No {index === 1 ? 'front' : 'back'} image
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-sm font-bold text-gray-500 mb-3">Personal information</div>
          <ul className="text-base divide-y divide-gray-200">
            <li className="border-t pt-2 py-2 flex justify-between">
              <span className="text-gray-600">Full name:</span>
              <span>{user.properties.FIRST + ' ' + user.properties.LAST}</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Country:</span>
              <span>{user.properties.COUNTRY}</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Identity number:</span>
              <span>{user.properties.PNR}</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="text-right">{user.properties.ADDR}</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{user.properties.EMAIL}</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Phone number:</span>
              <span>{user.properties.PHONE}</span>
            </li>
          </ul>
        </div>

        {user?.properties?.ORGNAME && user?.properties?.ORGNR && (
          <>
            <div className="bg-gray-50 p-4 rounded mb-6">
              <div className="text-sm font-bold text-gray-500 mb-3">Company information</div>
              <ul className="text-base divide-y divide-gray-200">
                <li className="border-t pt-2 py-2 flex justify-between">
                  <span className="text-gray-600">ID number:</span>
                  <span>{user.properties.ORGNR}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Legal name:</span>
                  <span>{user.properties.ORGNAME}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="text-right">
                    {user.properties.ORGADDR}
                    {user.properties.ORGADDR2 ? `, ${user.properties.ORGADDR2}` : ''}
                  </span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span>{user.properties.ORGCITY}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">ZIP:</span>
                  <span>{user.properties.ORGZIP}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Region:</span>
                  <span>{user.properties.ORGREGION}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span>{user.properties.ORGCOUNTRY}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-6">
              <div className="text-sm font-bold text-gray-500 mb-3">Legal representation</div>
              <div className="border-t border-gray-200 pt-2 text-sm text-gray-700">
                {user.properties.ORGROLE === 'owner' || user.properties.ORGROLE === 'Legal Representative' ? 'Yes' : 'No'}
              </div>
            </div>
          </>
        )}
        {user?.attachments?.[3]?.data ? (
          <>
        <div className="text-sm font-bold">Company legal document</div>
        <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
          <div
                className="w-[194px] h-[144px] border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center overflow-hidden cursor-pointer"

            onClick={() => {
              setCurrentImageIndex(3)
              setViewerOpen(true)
            }}
          >
            <img
              src={`data:image/jpeg;base64,${user.attachments[3].data}`}
                  alt={user.attachments[2].fileName || 'article_of_association'}
              className="w-full h-full object-cover"
            />
          </div>
       
            </div>
          </>
        ) : null}
          
        {denialMode && (
          <>
            <div className="mb-2 text-sm font-medium text-gray-600">
              Reason for denial of ID application <span className="text-gray-400 text-xs">(Will be sent to the applicant)</span>
            </div>
            {/* <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm mb-4"
              rows={3}
              placeholder="Message here"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
            /> */}
            <TiptapEditor content={denialReason} onChange={setDenialReason} />
          </>
        )}

        <div className="flex justify-center gap-8">
          {!denialMode ? (
            <>
              <button
                onClick={() => setDenialMode(true)}
                className="px-12 py-2 rounded-lg font-semibold bg-red-500 text-white hover:opacity-80 transition"
              >
                ❌ Deny ID application
              </button>
              <button
                onClick={() => {
                  setConfirmAction('approve')
                  setShowFinalConfirmPopup(true)
                }}
                className="px-12 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:opacity-80 transition"
              >
                ✔️ Approve ID application
              </button>
            </>
          ) : null}
        </div>

        {denialMode && (
          <div className="flex justify-center mt-4 gap-8">
            <button
              onClick={() => {
                if (denialReason.trim()) {
                  setConfirmAction('deny')
                  setShowFinalConfirmPopup(true)
                }
              }}
              disabled={!denialReason.trim()}
              className={`px-20 py-2 rounded-lg font-semibold text-white transition ${denialReason.trim()
                ? 'bg-red-500 hover:opacity-80'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
             Submit denial
            </button>
            <button
              onClick={() => {
                setDenialMode(false)
                setDenialReason('')
              }}
              className="px-24 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:opacity-80 transition"
            >
              Cancel denial
            </button>
          </div>
        )}

        {showFinalConfirmPopup && (
          <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-black/40 px-4">
            <div className="relative bg-white rounded-lg border border-gray-200 w-[90%] max-w-md p-6 text-center">
              <button
                onClick={() => setShowFinalConfirmPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {text?.textState}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {text?.textVerifiedEmail}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowFinalConfirmPopup(false)
                    if (confirmAction === 'approve') {
                      handleApprove()
                    } else if (confirmAction === 'deny') {
                      handleReject(denialReason)
                    }
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded font-semibold hover:opacity-80 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowFinalConfirmPopup(false)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded font-semibold hover:opacity-80 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {viewerOpen && (
          <ImageViewerModal
            images={imageList}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
