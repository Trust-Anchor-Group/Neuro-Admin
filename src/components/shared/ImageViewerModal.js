'use client'

import React, { useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'

export const ImageViewerModal = ({ images = [], currentIndex, setCurrentIndex, onClose }) => {
  const total = images.length
  const image = images[currentIndex]

  const handleNext = () => setCurrentIndex((currentIndex + 1) % total)
  const handlePrev = () => setCurrentIndex((currentIndex - 1 + total) % total)

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
  }

  const handleOverlayClick = (e) => {
    if (e.target.id === 'image-viewer-overlay') onClose()
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  if (!image) return null

  return (
    <div
      id="image-viewer-overlay"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-4xl w-full text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
        >
          <FaTimes size={22} />
        </button>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            className="text-gray-300 hover:text-white transition px-4"
            aria-label="Previous image"
          >
            <FaChevronLeft size={28} />
          </button>

          <div className="flex-1 flex justify-center">
            <img
              src={`data:image/jpeg;base64,${image.data}`}
              alt={image.fileName || `Image ${currentIndex + 1}`}
              className="max-h-[80vh] rounded-lg shadow-xl object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <button
            onClick={handleNext}
            className="text-gray-300 hover:text-white transition px-4"
            aria-label="Next image"
          >
            <FaChevronRight size={28} />
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-12 h-12 border rounded-md overflow-hidden ${i === currentIndex ? 'border-white' : 'border-gray-600 opacity-60'}`}
            >
              <img
                src={`data:image/jpeg;base64,${img.data}`}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="mt-2 text-center text-xs text-gray-300">
          {image.fileName || `Image ${currentIndex + 1}`} — {currentIndex + 1} / {total}
        </div>
      </div>
    </div>
  )
}
