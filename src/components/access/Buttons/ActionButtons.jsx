'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'
import { useLanguage, content } from '../../../../context/LanguageContext'
import { messageEmail } from '@/utils/messageEmail'
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
  const [showingActions, setShowingActions] = useState(new Set()) // animating in

  const storageKey = id ? `hiddenActions_${id}` : null
  const ANIM_MS = 200

  useEffect(() => {
    // load persisted hidden actions
    if (!storageKey) return
    try {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) setHiddenActions(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to read hidden actions from sessionStorage', e)
    }
  }, [storageKey])

  useEffect(() => {
    // initialise visibleActions from adminActions and persisted hiddenActions
    const all = (adminActions || []).map(a => a.actionTitle)
    const visible = all.filter(name => !hiddenActions.includes(name))
    setVisibleActions(visible)
  }, [adminActions, hiddenActions])

  const persistHiddenActions = (arr) => {
    if (!storageKey) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(arr))
    } catch (e) {
      console.error('Failed to persist hidden actions to sessionStorage', e)
    }
  }

  const animateHide = (action) => {
    // add to hiding set -> apply CSS hide transition -> remove from visible and persist after delay
    setHidingActions(prev => new Set(prev).add(action))
    setTimeout(() => {
      setHidingActions(prev => {
        const s = new Set(prev)
        s.delete(action)
        return s
      })
      setVisibleActions(prev => prev.filter(a => a !== action))
      const nextHidden = Array.from(new Set([...hiddenActions, action]))
      setHiddenActions(nextHidden)
      persistHiddenActions(nextHidden)
    }, ANIM_MS)
  }

  const animateShow = (action) => {
    // remove from persisted hiddenActions, add to visibleActions and mark as showing for enter animation
    const nextHidden = (hiddenActions || []).filter(a => a !== action)
    setHiddenActions(nextHidden)
    persistHiddenActions(nextHidden)

    if (!visibleActions.includes(action)) {
      setVisibleActions(prev => [...prev, action])
      // mark as showing then remove mark to trigger CSS transition to visible
      setShowingActions(prev => new Set(prev).add(action))
      // small delay -> remove "showing" so transition applies
      setTimeout(() => {
        setShowingActions(prev => {
          const s = new Set(prev)
          s.delete(action)
          return s
        })
      }, 20)
    }
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

  const handleConfirmQuickAction = async () => {
    // optimistically animate hide for Compromised
    if (confirmActionType === 'Compromised') {
      animateHide('Compromised')
    }

    await onHandleModal(
      confirmActionType,
      confirmActionType === 'Compromised' ? 'Compromise Id' : 'Obsolete Id'
    )
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
        // Send only minimal info to backend; backend handles all email formatting
        const res = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            user,
            reason,
          }),
        })
        const result = await res.json()
        if (!result.success) {
          console.error('❌ Failed to send email:', result.error, result.details)
        }
      }

      // refresh backend data
      getData()
      setToggle(false)
    } catch (error) {
      console.error('❌ Error during action handling:', error)
      // revert optimistic hide if needed
      if (confirmActionType === 'Compromised') {
        // if server failed and we optimistically hid, show it again
        setVisibleActions(prev => (prev.includes('Compromised') ? prev : [...prev, 'Compromised']))
        setHiddenActions(prev => prev.filter(a => a !== 'Compromised'))
        persistHiddenActions(hiddenActions.filter(a => a !== 'Compromised'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => onHandleModal('Approved', 'Approve ID application')
  const handleReject = (reason) => onHandleModal('Rejected', 'Deny ID application', reason)

  // helper to build button classes with smooth transitions
  const buttonTransitionClass = (title) => {
    const base = 'w-full shadow-sm py-2 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-all duration-200'
    const orange = 'bg-neuroDarkOrange/20 text-neuroDarkOrange hover:opacity-70'
    const red = 'bg-obsoletedRed/20 text-obsoletedRed hover:opacity-70'
    const disabled = loading ? 'opacity-50 pointer-events-none' : ''

    const isHiding = hidingActions.has(title)
    const isShowing = showingActions.has(title)

    const anim = isHiding ? 'opacity-0 scale-95 h-0 overflow-hidden' : isShowing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'

    return `${base} ${title === 'Compromised' ? orange : title === 'Obsoleted' ? red : ''} ${anim} ${disabled}`
  }

  return (
    <div className="mt-5 max-sm:p-5">
      {toggle && (
        <Modal
          text={getModalText(actionButtonName, buttonName, t)}
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

      {/* Obsoleted state: show Compromised button only if visibleActions contains it */}
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