'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'
import { useLanguage, content } from '../../../../context/LanguageContext'
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

export const ActionButtons = ({ user, adminActions, id, getData }) => {
  const { language } = useLanguage()
  const t = content[language]

  const [toggle, setToggle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionButtonName, setActionButtonName] = useState('')
  const [buttonName, setButtonName] = useState('')

  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmText, setConfirmText] = useState({ textState: '', textVerifiedEmail: '' })
  const [confirmActionType, setConfirmActionType] = useState('')

  // UI/animation state
  const [hiddenActions, setHiddenActions] = useState([]) // persisted hide (sessionStorage)
  const [visibleActions, setVisibleActions] = useState([]) // actions currently rendered
  const [hidingActions, setHidingActions] = useState(new Set()) // animating out

  const storageKey = id ? `hiddenActions_${id}` : null
  const ANIM_MS = 200

  useEffect(() => {
    if (!storageKey) return
    try {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) setHiddenActions(JSON.parse(stored))
    } catch (error) {
      console.error('Failed to read hidden actions from sessionStorage', error)
    }
  }, [storageKey])

  useEffect(() => {
    const all = (adminActions || []).map((action) => action.actionTitle)
    const visible = all.filter((name) => !hiddenActions.includes(name))
    setVisibleActions(visible)
  }, [adminActions, hiddenActions])

  const persistHiddenActions = (value) => {
    if (!storageKey) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to persist hidden actions to sessionStorage', error)
    }
  }

  const animateHide = (action) => {
    setHidingActions((prev) => new Set(prev).add(action))
    setTimeout(() => {
      setHidingActions((prev) => {
        const next = new Set(prev)
        next.delete(action)
        return next
      })
      setVisibleActions((prev) => prev.filter((item) => item !== action))
      const nextHidden = Array.from(new Set([...hiddenActions, action]))
      setHiddenActions(nextHidden)
      persistHiddenActions(nextHidden)
    }, ANIM_MS)
  }

  const handleReviewClick = () => {
    setActionButtonName('Review')
    setButtonName('Review ID application')
    setToggle(true)
  }

  const handleQuickAction = (action, label) => {
    setConfirmText(getModalText(action, label, t))
    setConfirmActionType(action)
    setShowConfirmPopup(true)
  }

  const restoreCompromisedAction = () => {
    setVisibleActions((prev) => (prev.includes('Compromised') ? prev : [...prev, 'Compromised']))
    const nextHidden = hiddenActions.filter((action) => action !== 'Compromised')
    setHiddenActions(nextHidden)
    persistHiddenActions(nextHidden)
  }

  async function onHandleModal(action = '', label = '', reason = '') {
    if (!action) return false

    setLoading(true)
    setActionButtonName(action)
    setButtonName(label)

    try {
      const changeState = await pendingAction(id, action, {
        user,
        reason,
        sendNotification: true,
      })

      if (!changeState.ok) {
        throw new Error(changeState.data?.message || 'Failed to change identity state')
      }

      const notification = changeState.data?.data?.notification
      if (notification && notification.success === false) {
        console.error('Identity state changed, but notification failed:', notification.error, notification.details)
      }

      getData()
      setToggle(false)
      return true
    } catch (error) {
      console.error('Error during action handling:', error)
      if (confirmActionType === 'Compromised') {
        restoreCompromisedAction()
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmQuickAction = async () => {
    if (confirmActionType === 'Compromised') {
      animateHide('Compromised')
    }

    const success = await onHandleModal(
      confirmActionType,
      confirmActionType === 'Compromised' ? 'Compromise Id' : 'Obsolete Id'
    )

    if (success) {
      setShowConfirmPopup(false)
    }
  }

  const handleApprove = () => onHandleModal('Approved', 'Approve ID application')
  const handleReject = (reason) => onHandleModal('Rejected', 'Deny ID application', reason)

  const buttonTransitionClass = (title) => {
    const base = 'w-full shadow-sm py-2 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-all duration-200'
    const orange = 'bg-neuroDarkOrange/20 text-neuroDarkOrange hover:opacity-70'
    const red = 'bg-obsoletedRed/20 text-obsoletedRed hover:opacity-70'
    const disabled = loading ? 'opacity-50 pointer-events-none' : ''

    const isHiding = hidingActions.has(title)
    const anim = isHiding ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100'

    return `${base} ${title === 'Compromised' ? orange : title === 'Obsoleted' ? red : ''} ${anim} ${disabled}`
  }

  return (
    <div className="mt-5 max-sm:p-5">
      {toggle && (
        <Modal
          text={getModalText(actionButtonName, buttonName, t)}
          setToggle={setToggle}
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
                {t?.actionButtons?.confirm || 'Confirm'}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded font-semibold hover:opacity-80 transition"
              >
                {t?.actionButtons?.cancel || 'Cancel'}
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
            {t?.actionButtons?.reviewApplication || 'Review application'}
          </button>
        </div>
      )}

      {user?.state === 'Obsoleted' && visibleActions.includes('Compromised') && (
        <div className="mb-4">
          <button
            onClick={() => handleQuickAction('Compromised', 'Compromise Id')}
            className={buttonTransitionClass('Compromised')}
          >
            <FaExclamationTriangle /> {t?.actionButtons?.compromiseId || 'Compromise Id'}
          </button>
        </div>
      )}

      {user && !['Created', 'Obsoleted'].includes(user.state) && (
        <>
          {visibleActions.includes('Compromised') && (
            <div className="mb-4">
              <button
                onClick={() => handleQuickAction('Compromised', 'Compromise Id')}
                className={buttonTransitionClass('Compromised')}
              >
                <FaExclamationTriangle /> {t?.actionButtons?.compromiseId || 'Compromise Id'}
              </button>
            </div>
          )}

          <div>
            <button
              onClick={() => handleQuickAction('Obsoleted', 'Obsolete Id')}
              className={buttonTransitionClass('Obsoleted')}
            >
              <FaExclamationTriangle /> {t?.actionButtons?.obsoleteId || 'Obsolete Id'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
