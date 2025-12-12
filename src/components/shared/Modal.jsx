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
    } catch (e) {
      return { error: { message: e.message, type: 'ParseError', service: 'XML' }, rawXml: xmlString };
    }
  }

  // If present, decode and parse the XML
  let serproResults = null;
  if (applicationReviewXml?.data) {
    try {
      let xmlString = atob(applicationReviewXml.data); // base64 decode
      // Remove any trailing non-printable or non-XML characters (e.g., \uFFFD, \0, etc.)
      xmlString = xmlString.replace(/[^\x20-\x7E\r\n\t]+$/g, '');
      serproResults = parseSerproXml(xmlString);
    } catch (e) {
      serproResults = { error: { message: e.message, type: 'Base64DecodeError', service: 'XML' }, rawXml: applicationReviewXml.data };
    }
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

        {/* Enhanced Serpro Validation Panel */}
        {serproResults && serproResults.error && serproResults.error.type === 'ParseError' && (
          <section className="mb-6 rounded-xl border border-red-400 bg-red-50 p-5">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Malformed XML</h3>
            <div className="text-sm text-red-800 mb-2">{serproResults.error.message}</div>
            <details className="bg-white border border-red-200 rounded p-2 text-xs overflow-x-auto" open>
              <summary className="cursor-pointer select-none font-mono text-red-600">Show raw XML</summary>
              <pre className="whitespace-pre-wrap break-all text-[10px] text-red-900">{serproResults.rawXml}</pre>
            </details>
          </section>
        )}
        {serproResults && (!serproResults.error || serproResults.error.type !== 'ParseError') && (() => {
          const totalClaims = (serproResults.validatedClaims?.length || 0) + (serproResults.unvalidatedClaims?.length || 0);
          const validatedCount = serproResults.validatedClaims?.length || 0;
          const percent = totalClaims ? Math.round((validatedCount / totalClaims) * 100) : 0;
          // Simple categories mapping (group common fields); fallback to 'Other'
          const categoryMap = {
            FIRST: 'Identity', LAST: 'Identity', MID: 'Identity', DOB: 'Identity', BDAY:'Identity', BMONTH:'Identity', BYEAR:'Identity',
            PNR: 'Identity', GENDER: 'Identity', NATIONALITY: 'Identity',
            EMAIL: 'Contact', PHONE: 'Contact',
            ADDR: 'Location', ZIP:'Location', CITY:'Location', COUNTRY:'Location', AREA:'Location', REGION:'Location'
          };
          const groupClaims = (arr, validated) => arr.reduce((acc, c) => {
            const key = c.claim || c; // c is either object (validated) or string (unvalidated)
            const cat = categoryMap[key] || 'Other';
            acc[cat] = acc[cat] || [];
            acc[cat].push({ name: key, service: c.service, validated });
            return acc;
          }, {});
          const groupedValidated = groupClaims(serproResults.validatedClaims || [], true);
          const groupedMissing = groupClaims(serproResults.unvalidatedClaims || [], false);
          const allCategories = Array.from(new Set([...Object.keys(groupedValidated), ...Object.keys(groupedMissing)]));
          return (
            <section aria-labelledby="serpro-review-heading" className="mb-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]/80 backdrop-blur p-5">
              <header className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 id="serpro-review-heading" className="text-lg font-semibold text-[var(--brand-text)]">
                      {t.serpro?.title || 'Automated Validation (Serpro)'}
                    </h3>
                    <p className="text-xs text-[var(--brand-text-secondary)]">
                      {t.serpro?.subtitle || 'System validation summary. Manually verify any remaining fields.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">{t.serpro?.source || 'Serpro'}</span>
                    <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-700 font-medium">{percent}% {t.serpro?.complete || 'Complete'}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded bg-[var(--brand-navbar)] overflow-hidden" aria-label={t.serpro?.progressLabel || 'Validation progress'}>
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${percent}%` }} />
                </div>
              </header>
              {serproResults.error && (
                <div className="mb-4 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 p-3" role="alert">
                  <span className="text-red-600 font-semibold">{t.serpro?.errorLabel || 'Service Error'}:</span>
                  <div className="text-sm text-red-700">
                    {serproResults.error.message}
                    <div className="text-xs mt-1 opacity-80">
                      {(t.serpro?.errorMeta || 'Type/Service')}:{' '}{serproResults.error.type} / {serproResults.error.service}
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {allCategories.map(cat => {
                  const validated = groupedValidated[cat] || [];
                  const missing = groupedMissing[cat] || [];
                  return (
                    <details key={cat} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)]" open>
                      <summary className="cursor-pointer select-none px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--brand-text)]">{cat}</span>
                        <span className="flex gap-2 text-[10px] uppercase tracking-wide">
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700">{validated.length} {t.serpro?.validatedShort || 'OK'}</span>
                          <span className="px-2 py-1 rounded bg-orange-100 text-orange-700">{missing.length} {t.serpro?.missingShort || 'Pending'}</span>
                        </span>
                      </summary>
                      <div className="px-4 pb-3">
                        {validated.length > 0 && (
                          <ul className="mb-2 text-sm space-y-1" aria-label={t.serpro?.validatedClaims || 'Validated Claims'}>
                            {validated.map(item => (
                              <li key={item.name} className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                <span className="font-medium" title={item.service}>{item.name}</span>
                                <span className="text-[10px] text-[var(--brand-text-secondary)]">{item.service?.split('.').pop()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {missing.length > 0 && (
                          <ul className="text-sm space-y-1" aria-label={t.serpro?.missingClaims || 'Missing Claims'}>
                            {missing.map(item => (
                              <li key={item.name} className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                                <span className="font-medium" title={t.serpro?.requiresManual || 'Requires manual review'}>{item.name}</span>
                                <span className="text-[10px] text-[var(--brand-text-secondary)]">{t.serpro?.pending || 'Pending review'}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {!validated.length && !missing.length && (
                          <p className="text-xs italic text-[var(--brand-text-secondary)]">{t.serpro?.emptyCategory || 'No data for this category.'}</p>
                        )}
                      </div>
                    </details>
                  );
                })}
                <details className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)]" open>
                  <summary className="cursor-pointer select-none px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--brand-text)]">{t.serpro?.photosTitle || 'Photos'}</span>
                    <span className="text-[10px] px-2 py-1 rounded bg-yellow-100 text-yellow-700">{serproResults.unvalidatedPhotos?.length || 0} {t.serpro?.pending || 'Pending'}</span>
                  </summary>
                  <div className="px-4 pb-3">
                    {serproResults.unvalidatedPhotos?.length ? (
                      <ul className="text-sm space-y-1" aria-label={t.serpro?.photoStatus || 'Photo Status'}>
                        {serproResults.unvalidatedPhotos.map(f => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                            <span className="font-medium" title={t.serpro?.requiresManualPhoto || 'Needs manual validation'}>{f}</span>
                            <span className="text-[10px] text-[var(--brand-text-secondary)]">{t.serpro?.pending || 'Pending review'}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-[var(--brand-text-secondary)]">{t.serpro?.photosOk || 'All required photos validated.'}</p>
                    )}
                  </div>
                </details>
              </div>
              <footer className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide">
                <span className="px-2 py-1 rounded bg-green-100 text-green-700">{t.serpro?.validatedBadge || 'Validated'}: {validatedCount}</span>
                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700">{t.serpro?.missingBadge || 'Missing'}: {serproResults.unvalidatedClaims?.length || 0}</span>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">{t.serpro?.photosBadge || 'Photos'}: {serproResults.unvalidatedPhotos?.length || 0}</span>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">{t.serpro?.totalBadge || 'Total'}: {totalClaims}</span>
              </footer>
            </section>
          );
        })()}

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
