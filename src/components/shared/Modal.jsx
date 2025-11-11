'use client'

import React, { useState } from 'react'
import { FaSpinner, FaTimes } from 'react-icons/fa'
import { ImageViewerModal } from './ImageViewerModal'
import { TiptapEditor } from './TiptapEditor'
import { useLanguage, content } from '../../../context/LanguageContext'

export const Modal = ({ setToggle, loading, user, text, handleApprove, handleReject }) => {
  const { language } = useLanguage();
  const t = content?.[language] || {};
  const [showFinalConfirmPopup, setShowFinalConfirmPopup] = useState(false)
  const [denialMode, setDenialMode] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Exclude ApplicationReview.xml from image list
  const imageList = user.attachments?.filter(a => a?.data && a.fileName !== 'ApplicationReview.xml') || [];

  // Find ApplicationReview.xml attachment (if any)
  const applicationReviewXml = user.attachments?.find(a => a.fileName === 'ApplicationReview.xml');


  // Parse XML string to extract error, validatedClaim, unvalidatedClaim, unvalidatedPhoto
  function parseSerproXml(xmlString) {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      // Error
      const errorNode = xmlDoc.getElementsByTagName('error')[0];
      const error = errorNode ? {
        message: errorNode.getAttribute('message'),
        type: errorNode.getAttribute('type'),
        service: errorNode.getAttribute('service')
      } : null;
      // Validated claims
      const validatedClaims = Array.from(xmlDoc.getElementsByTagName('validatedClaim')).map(c => ({
        claim: c.getAttribute('claim'),
        service: c.getAttribute('service')
      }));
      // Unvalidated claims
      const unvalidatedClaims = Array.from(xmlDoc.getElementsByTagName('unvalidatedClaim')).map(c => c.getAttribute('claim'));
      // Unvalidated photos
      const unvalidatedPhotos = Array.from(xmlDoc.getElementsByTagName('unvalidatedPhoto')).map(p => p.getAttribute('fileName'));
      return { error, validatedClaims, unvalidatedClaims, unvalidatedPhotos };
    } catch {
      return null;
    }
  }

  // If present, decode and parse the XML
  let serproResults = null;
  if (applicationReviewXml?.data) {
    try {
      const xmlString = atob(applicationReviewXml.data); // base64 decode
      serproResults = parseSerproXml(xmlString);
    } catch {}
  }


  // Helper to get attachment by exact filename (case-insensitive)
  function getAttachmentByExactName(fileName) {
    return user.attachments?.find(a => a.fileName && a.fileName.toLowerCase() === fileName.toLowerCase());
  }

  // KyC filenames
  const applicantPhoto = getAttachmentByExactName('ProfilePhoto.jpg');
  const idFront = getAttachmentByExactName('IdCardFront.jpg');
  const idBack = getAttachmentByExactName('IdCardBack.jpg');
  const passport = getAttachmentByExactName('Passport.jpg');
  const driverFront = getAttachmentByExactName('DriverLicenseFront.jpg');
  const driverBack = getAttachmentByExactName('DriverLicenseBack.jpg');

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
      <div className="relative bg-[var(--brand-navbar)] rounded-lg border border-[var(--brand-border)] w-full max-w-2xl p-6 overflow-y-auto max-h-screen sm:max-h-[90vh]">
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

        <header className="border-b border-[var(--brand-border)] pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-[var(--brand-text-color)]">{t.title || 'Review ID application'}</h2>
        </header>

        {/* Serpro Validation Results */}
        {/* {serproResults && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-4">
            <div className="text-base font-bold text-blue-700 mb-2">Serpro Validation Results</div>
            <ul className="text-sm text-blue-900 space-y-1">
              {serproResults.error && (
                <li className="text-red-700 font-semibold">Error: {serproResults.error.message} (Type: {serproResults.error.type}, Service: {serproResults.error.service})</li>
              )}
              {serproResults.validatedClaims && serproResults.validatedClaims.length > 0 && (
                <li>
                  <span className="font-medium">Validated Claims:</span>
                  <ul className="ml-4 list-disc">
                    {serproResults.validatedClaims.map((c, i) => (
                      <li key={c.claim + c.service + i}>{c.claim} <span className="text-xs text-gray-500">({c.service})</span></li>
                    ))}
                  </ul>
                </li>
              )}
              {serproResults.unvalidatedClaims && serproResults.unvalidatedClaims.length > 0 && (
                <li>
                  <span className="font-medium">Unvalidated Claims:</span>
                  <ul className="ml-4 list-disc">
                    {serproResults.unvalidatedClaims.map((c, i) => (
                      <li key={c + i}>{c}</li>
                    ))}
                  </ul>
                </li>
              )}
              {serproResults.unvalidatedPhotos && serproResults.unvalidatedPhotos.length > 0 && (
                <li>
                  <span className="font-medium">Unvalidated Photos:</span>
                  <ul className="ml-4 list-disc">
                    {serproResults.unvalidatedPhotos.map((f, i) => (
                      <li key={f + i}>{f}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )} */}

        <div className="text-sm font-bold mb-2">Applicant photo</div>
        <div className="flex mb-6">
          {applicantPhoto?.data ? (
            <div
              className="w-32 h-32 rounded-lg overflow-hidden border cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(imageList.indexOf(applicantPhoto))
                setViewerOpen(true)
              }}
            >
              <img
                src={`data:image/jpeg;base64,${applicantPhoto.data}`}
                alt={applicantPhoto.fileName || 'Applicant Photo'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-sm text-gray-500 border">
              {t.noPhoto || 'No photo'}
            </div>
          )}
        </div>

        <div className="text-sm font-bold">Applicant identification</div>
        <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
          <div className="text-sm font-bold text-gray-500 mb-3">Identification chosen</div>
          <div className="border-t border-gray-200 pt-2 text-base text-gray-700">
            {idFront ? 'National ID card'
              : passport ? 'Passport'
              : driverFront ? 'Driver License'
              : 'Unknown'}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {[{att: idFront, label: 'ID Card Front'}, {att: idBack, label: 'ID Card Back'}, {att: passport, label: 'Passport'}, {att: driverFront, label: 'Driver License Front'}, {att: driverBack, label: 'Driver License Back'}]
            .filter(({att}) => att)
            .map(({att, label}, idx) => (
              <div
                key={att.fileName || label}
                className="w-[194px] h-[144px] border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(imageList.indexOf(att))
                  setViewerOpen(true)
                }}
              >
                {att.data ? (
                  <img
                    src={`data:image/jpeg;base64,${att.data}`}
                    alt={att.fileName || label}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">
                    No {label}
                  </span>
                )}
              </div>
            ))}
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-sm font-bold text-gray-500 mb-3">Personal information</div>
          <ul className="text-base divide-y divide-gray-200">
            {user?.properties && Object.keys(user.properties).map((key, idx) => (
              <li key={key} className={`pt-2 py-2 flex justify-between${idx === 0 ? ' border-t' : ''}`}>
                <span className="text-gray-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                <span className="text-right">{user.properties[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skipping company docs as requested */}
        {/* {companyDoc?.data ? (
          <>
            <div className="text-sm font-bold">Company legal document</div>
            <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
              <div
                className="w-[194px] h-[144px] border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(imageList.indexOf(companyDoc))
                  setViewerOpen(true)
                }}
              >
                <img
                  src={`data:image/jpeg;base64,${companyDoc.data}`}
                  alt={companyDoc.fileName || 'article_of_association'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </>
        ) : null} */}
          
        {denialMode && (
          <>
            <div className="mb-2 text-sm font-medium text-[var(--brand-text-secondary)]">
              {t.denialReasonLabel || 'Reason for denial of ID application'} <span className="text-[var(--brand-text-secondary)] text-xs">{t.denialReasonHint || '(Will be sent to the applicant)'}</span>
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
                ❌ {t.denyButton || 'Deny ID application'}
              </button>
              <button
                onClick={() => {
                  setConfirmAction('approve')
                  setShowFinalConfirmPopup(true)
                }}
                className="px-12 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:opacity-80 transition"
              >
                ✔️ {t.approveButton || 'Approve ID application'}
              </button>
            </>
          ) : null}
        </div>

        {denialMode && (
          <div className="flex justify-center mt-4 gap-8">
            <button
              onClick={() => {
                setDenialMode(false)
                setDenialReason('')
              }}
              className="px-[15%] py-2 rounded-lg font-semibold bg-[#F2495C33] text-[#A81123] hover:opacity-80 transition"
            >
              {t.cancelDenial || 'Cancel denial'}
            </button>
            <button
              onClick={() => {
                if (denialReason.trim()) {
                  setConfirmAction('deny')
                  setShowFinalConfirmPopup(true)
                }
              }}
              disabled={!denialReason.trim()}
              className={`px-[15%] py-2 rounded-lg font-semibold text-white transition ${denialReason.trim()
                ? 'bg-red-500 hover:opacity-80'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
             {t.submitDenial || 'Submit denial'}
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
