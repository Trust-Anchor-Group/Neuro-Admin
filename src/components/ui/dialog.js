"use client"; 

import { useState } from "react";

export function Dialog({ triggerText, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-gray-500 text-white px-3 py-1 rounded-lg">
        {triggerText}
      </button>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {children}
            <button onClick={() => setIsOpen(false)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
