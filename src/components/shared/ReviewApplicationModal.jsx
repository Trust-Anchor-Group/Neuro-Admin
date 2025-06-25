import React from 'react'
import { FaTimes } from 'react-icons/fa'

export const ReviewApplicationModal = ({ open, onClose, applicant }) => {
  if (!open) return null

  // Use dummy data if no applicant prop is provided
  const data = applicant || {
    name: "Jane Doe",
    dob: "1990-01-01",
    email: "jane.doe@example.com"
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20">
      <div className="relative bg-white p-6 rounded-lg shadow-lg min-w-[320px] max-w-[90vw]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:bg-gray-200 rounded-full p-1"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Review Application</h2>
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{data.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date of Birth:</span>
            <span className="ml-2 text-gray-900">{data.dob}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{data.email}</span>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-neuroPurpleLight text-neuroPurpleDark px-4 py-2 rounded-lg font-semibold hover:opacity-70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
