import React from 'react'
import { FaSpinner, FaTimes } from 'react-icons/fa'

export const Modal = ({
  setToggle,
  onHandleModal,
  loading
}) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30">
      <div className="relative bg-white rounded-lg border border-gray-200 w-full max-w-2xl p-6 overflow-y-auto max-h-screen sm:max-h-[90vh]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </div>
        )}

        {/* Header */}
        <header className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Review ID application
          </h2>
        </header>

        {/* Close button */}
        <button
          onClick={() => setToggle(prev => !prev)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>

        {/* Applicant photo */}
        <div className="self-stretch text-[var(--Content-Primary,#181F25)] font-[Space Grotesk] text-[16px] font-bold leading-[120%] tracking-[0.016px] mb-2">Applicant photo</div>
        <div className="flex mb-6">
          <img
            src="https://via.placeholder.com/120x120.png?text=Photo"
            alt="Applicant"
            className="w-32 h-32 rounded-lg object-cover border"
          />
        </div>

        {/* Identification chosen */}
        <div className="self-stretch text-[var(--Content-Primary,#181F25)] font-[Space Grotesk] text-[16px] font-bold leading-[120%] tracking-[0.016px]">Applicant identification</div>
          <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
            <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Identification chosen</div>
            <div className="border-t border-gray-200 pt-[8px] text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Roboto] text-[16px] font-normal leading-[140%] tracking-[0.016px]">National ID card</div>
          </div>

        {/* ID-Front and Back */}
        <div className="flex flex-row gap-[16px] mb-[24px]">
          <div className="w-[194px] h-[144px] box-border border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center">
            [ photo of ID front ]
          </div>
          <div className="w-[194px] h-[144px] box-border border-2 bg-gray-200 rounded-[8px] p-[8px] flex items-center justify-center">
            [ photo of ID back ]
          </div>
        </div>

        {/* Personal information */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Personal information</div>
          <ul className="font-[Roboto] divide-y divide-gray-200">
            <li className="border-t border-gray-200 pt-[8px] py-2 flex justify-between">
              <span className="text-gray-600">Full name:</span>
              <span>Adam Ingot</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Date of birth:</span>
              <span>1990-12-10</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Identity number:</span>
              <span>199012100569</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="text-right">
                456 Oak Ave<br/>
                San Francisco, CA 94102
              </span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>adam.ingot@neuro.com</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Phone number:</span>
              <span>+46 735 345 3648</span>
              <span className="text-sm text-gray-400">(SE)</span>
            </li>
          </ul>
        </div>

        {/* Application type */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Application type</div>
          <div className="border-t border-gray-200 pt-[8px] text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Roboto] text-[16px] font-normal leading-[140%] tracking-[0.016px]">Individual</div>
        </div>
        
        {/* Company infromation */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Company information</div>
          <ul className="font-[Roboto] divide-y divide-gray-200">
            <li className="border-t border-gray-200 pt-[8px] py-2 flex justify-between">
              <span className="text-gray-600">ID number:</span>
              <span>2342463-234236234</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Legal name:</span>
              <span>Distributed Business Solutions ltd.</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Trade name:</span>
              <span>Solutiony</span>
            </li>
            <li className="py-2 flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span>456 Oak Ave, San Francisco, CA 94102</span>
            </li>
          </ul>
        </div>   

        {/* Is the user the legal representative of this company? */}
         <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Is the user the legal representative of this company?</div>
          <div className="border-t border-gray-200 pt-[8px] text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Roboto] text-[16px] font-normal leading-[140%] tracking-[0.016px]">No</div>
        </div>

        {/* Representative information */}
          <div className="bg-gray-50 p-4 rounded mb-6">
            <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Representative information</div>
            <ul className="divide-y divide-gray-200 font-[Roboto]">
              <li className="border-t border-gray-200 pt-[8px] py-2 flex justify-between">
                <span className="text-gray-600">Full name:</span>
                <span>Adam Ingot</span>
              </li>
              <li className="py-2 flex justify-between">
                <span className="text-gray-600">Date of birth:</span>
                <span>1990-12-10</span>
              </li>
              <li className="py-2 flex justify-between">
                <span className="text-gray-600">Identity number:</span>
                <span>199012100569</span>
              </li>
              <li className="py-2 flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span>456 Oak Ave, San Francisco, CA 94102</span>
              </li>
              <li className="py-2 flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>adam.ingot@neuro.com</span>
              </li>
              <li className="py-2 flex justify-between">
                <span className="text-gray-600">Phone number:</span>
                <span>+46 735 345 3648</span>
                <span>(SE)</span>
              </li>
            </ul>
          </div>

        {/* Legal representative identification */}
        <div className="self-stretch text-[var(--Content-Primary,#181F25)] font-[Space Grotesk] text-[16px] font-bold leading-[120%] tracking-[0.016px]">Legal representative identification</div>
          <div className="mt-2 bg-gray-50 p-4 rounded mb-6">
            <div className="text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Space Grotesk] font-bold text-[14px] leading-[120%] tracking-[0.1%] mb-3">Identification chosen</div>
            <div className="border-t border-gray-200 pt-[8px] text-[var(--Content-Secondary,rgba(24,31,37,0.62))] font-[Roboto] text-[16px] font-normal leading-[140%] tracking-[0.016px]">National ID card</div>
          </div>


      </div>
    </div>
  )
}
