'use client'
import React, { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'
import { messageEmail } from '@/utils/messageEmail'
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

export const ActionButtons = ({ user, adminActions, id, getData }) => {
  const [toggle, setToggle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionButtonName, setActionButtonName] = useState('')
  const [buttonName, setButtonName] = useState('')

  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmText, setConfirmText] = useState({ textState: '', textVerifiedEmail: '' })
  const [confirmActionType, setConfirmActionType] = useState('')

  const handleReviewClick = () => {
    setActionButtonName('Review')
    setButtonName('Review ID application')
    setToggle(true)
  }

  const handleQuickAction = (action, label) => {
    setConfirmText(getModalText(action, label))
    setConfirmActionType(action)
    setShowConfirmPopup(true)
  }

  const handleConfirmQuickAction = async () => {
    await onHandleModal(confirmActionType, confirmActionType === 'Compromised' ? 'Compromise Id' : 'Obsolete Id')
    setShowConfirmPopup(false)
  }

  async function onHandleModal(action = '', label = '', reason = '') {
    if (!action) return

    setLoading(true)
    setActionButtonName(action)
    setButtonName(label)

    try {
      const changeState = await pendingAction(id, action)

      if (changeState.status === 200) {
        const { title, message } = messageEmail(action)

        const fullMessage = action === 'Rejected' && reason?.trim()
          ? `${message}\n\nReason:\n${reason}`
          : message

        const res = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: user.properties.EMAIL,
            name: user.properties.FIRST,
            title,
            message: fullMessage,
          }),
        })

        const result = await res.json()
        if (!result.success) {
          console.error('❌ Failed to send email:', result.error)
        }
      }

      getData()
      setToggle(false)
    } catch (error) {
      console.error('❌ Error during action handling:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => onHandleModal('Approved', 'Approve ID application')
  const handleReject = (reason) => onHandleModal('Rejected', 'Deny ID application', reason)

  return (
    <div className="mt-5 max-sm:p-5">
      {toggle && (
        <Modal
          text={getModalText(actionButtonName, buttonName)}
          setToggle={setToggle}
          onHandleModal={onHandleModal}
          loading={loading}
          user={user}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      )}

      {showConfirmPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-black/40 px-4">
          <div className="relative bg-white rounded-lg border border-gray-200 w-[90%] max-w-md p-6 text-center">
            <button
              onClick={() => setShowConfirmPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {confirmText.textState}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {confirmText.textVerifiedEmail}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmQuickAction}
                className="px-4 py-2 bg-green-100 text-green-700 rounded font-semibold hover:opacity-80 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded font-semibold hover:opacity-80 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {user?.state === 'Created' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleReviewClick}
            className="bg-[#8F40D4] text-white shadow-sm px-20 py-2 font-semibold rounded-lg hover:opacity-80 transition"
          >
            Review application
          </button>
        </div>
      )}

      {user?.state === 'Obsoleted' && (
        <button
          onClick={() => handleQuickAction('Compromised', 'Compromise Id')}
          className="w-full bg-neuroDarkOrange/20 text-neuroDarkOrange shadow-sm py-2 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 mb-4"
        >
          <FaExclamationTriangle /> Compromise Id
        </button>
      )}

      {user && !['Created', 'Obsoleted'].includes(user.state) && (
        <>
          <button
            onClick={() => handleQuickAction('Compromised', 'Compromise Id')}
            className="w-full bg-neuroDarkOrange/20 text-neuroDarkOrange shadow-sm py-2 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 mb-4"
          >
            <FaExclamationTriangle /> Compromise Id
          </button>
          <button
            onClick={() => handleQuickAction('Obsoleted', 'Obsolete Id')}
            className="w-full bg-obsoletedRed/20 text-obsoletedRed shadow-sm py-2 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
          >
            <FaExclamationTriangle /> Obsolete Id
          </button>
        </>
      )}
    </div>
  )
}
