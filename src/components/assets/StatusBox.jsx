import React from 'react'
import { useLanguage, content } from '../../../context/LanguageContext'

export const StatusBox = ({ statusCard, title }) => {
  // Status color mapping
  const statusStyles = {
    'Paused': {
      bar: 'bg-gradient-to-r from-orange-400 to-orange-500',
      cardBg: '#d6b94543', // orange-10
      cardText: '#F59E42', // orange-500
    },
    'Aborted': {
      bar: 'bg-gradient-to-r from-red-500 to-red-600',
      cardBg: '#dc434335', // red-100
      cardText: '#EF4444', // red-500
    },
    'Complete': {
      bar: 'bg-gradient-to-r from-green-500 to-green-600',
      cardBg: '#3eda7543', // green-100
      cardText: '#22C55E', // green-500
    },
    'In progress': {
      bar: 'bg-gradient-to-r from-purple-500 to-purple-600',
      cardBg: 'rgba(143, 64, 212, 0.15)', // purple-200
      cardText: '#9333EA', // purple-700
    },
    'Not started': {
      bar: 'bg-gradient-to-r from-gray-400 to-gray-500',
      cardBg: '#3a68c443', // gray-100
      cardText: '#6B7280', // gray-500
    },
  };
  const { language } = useLanguage();
  const t = content[language];
  const currentStyle = statusStyles[statusCard.status] || statusStyles['Not started'];
  const statusLabel = title || t?.assetOrderDetail?.statusBox?.status || 'Status';
  return (
    <div
      className="shadow-md rounded-xl p-4 w-full max-w-sm"
      style={{

        background: 'var(--brand-navbar)',
        color: 'var(--brand-text)',
      }}
    >
      <div
        className="flex items-center justify-between pb-3 border-b mb-2"
        style={{ borderColor: 'var(--brand-border)' }}
      >
  <h2 className="text-xl font-bold" style={{ color: 'var(--brand-text)' }}>{statusLabel}</h2>
        <span
          className="text-xs font-bold px-2 py-1 rounded-md"
          style={{
            background: currentStyle.cardBg,
            color: currentStyle.cardText,
          }}
        >
          {statusCard.status}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold" style={{ color: 'var(--brand-text)' }}>
          {statusCard.progress}%
        </span>
        <span className="font-semibold text-sm" style={{ color: 'var(--brand-text-secondary)' }}>
          {statusCard.amount}
        </span>
      </div>
      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-4 relative"
        style={{ background: currentStyle.cardBg }}
      >
        <div
          className={`h-2 rounded-full transition-all duration-300 mx-1 absolute left-0 right-0 ${currentStyle.bar}`}
          style={{ width: `calc(${statusCard.progress}% - 0.5rem)`, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    </div>
  );
};

