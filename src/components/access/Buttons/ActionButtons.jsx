import React, { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { pendingAction } from '../pendingFetch'
import { getModalText } from '@/utils/getModalText'
import { messageEmail } from '@/utils/messageEmail'

export const ActionButtons = ({ user, adminActions, id, getData }) => {
  const [toggle, setToggle] = useState(false)
  const [actionButtonName, setActionButtonName] = useState('')
  const [buttonName, setButtonName] = useState('')
  const [loading, setLoading] = useState(false)

  async function onHandleModal() {
    setLoading(true)

    try {
      const changeState = await pendingAction(id, actionButtonName)

      if (changeState.status === 200) {
        const { title, message } = messageEmail(actionButtonName)

        const res = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: user.properties.EMAIL,
            name: user.properties.FIRST,
            title,
            message,
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

  function onToggleHandler(btnName, btnText) {
    setToggle(true)
    setActionButtonName(btnName)
    setButtonName(btnText)
  }

  const renderButtons = (filterFn) => (
    <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
      {adminActions.filter(filterFn).map((btn, index) => (
        <button
          key={index}
          onClick={() => onToggleHandler(btn.actionTitle, btn.name)}
          className={`w-full ${btn.bgColor} ${btn.textColor} shadow-sm py-1 flex justify-center items-center font-semibold gap-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70`}
        >
          <btn.icon aria-hidden="true" /> {btn.name}
        </button>
      ))}
    </div>
  )

  return (
    <div className="mt-5 max-sm:p-5">
      {toggle && (
        <Modal
          text={getModalText(actionButtonName, buttonName)}
          setToggle={setToggle}
          onHandleModal={onHandleModal}
          loading={loading}
        />
      )}

      {user?.state === 'Created' &&
        renderButtons(btn =>
          ['Approved', 'Rejected'].includes(btn.actionTitle)
        )}

      {user?.state === 'Obsoleted' &&
        renderButtons(btn =>
          btn.actionTitle === 'Compromised'
        )}

      {user && !['Created', 'Obsoleted'].includes(user.state) &&
        renderButtons(btn =>
          ['Compromised', 'Obsoleted'].includes(btn.actionTitle)
        )}
    </div>
  )
}
