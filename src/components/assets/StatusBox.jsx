import React from 'react'

export const StatusBox = ({statusCard}) => {
  return (
    <div
      className="shadow-sm rounded-xl border p-4 w-full max-w-sm"
      style={{

        background: 'var(--brand-background)',
        color: 'var(--brand-text)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <div
        className="flex items-center justify-between pb-3 border-b mb-2"
        style={{ borderColor: 'var(--brand-border)' }}
      >
        <h2 className="text-xl font-bold" style={{ color: 'var(--brand-text)' }}>Status</h2>
        <span
          className="text-xs font-bold px-2 py-1 rounded-md"
          style={{
            background: '#E9D5FF', // brighter purple
            color: '#9333EA', // vibrant purple
          }}
        >
          {statusCard.status}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold" style={{ color: 'var(--brand-text)' }}>
          {statusCard.progress}%
          <span className="text-sm font-bold ml-2" style={{ color: 'var(--brand-text-secondary)' }}>complete</span>
        </span>
        <span className="font-semibold text-sm" style={{ color: 'var(--brand-text-secondary)' }}>
          {statusCard.amount}
        </span>
      </div>
      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-4 bg-purple-100 relative"
        style={{ background: '#F3E8FF' }}
      >
        <div
          className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 mx-1 absolute left-0 right-0"
          style={{ width: `calc(${statusCard.progress}% - 0.5rem)`, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    </div>
  );
};

