import Link from 'next/link';
import React from 'react';

export const LinkToPage = ({ hrefName, title, handleLogout, icon, setToggle, linkClassName }) => {
  const isLogout = !!handleLogout;

  if (isLogout) {
    return (
      <button
        onClick={async () => {
          await handleLogout();
          setToggle(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--brand-hover)] transition-colors text-red-600`}
      >
        {icon}
        <span className={linkClassName}>{title}</span>
      </button>
    );
  }

  return (
    <Link
      href={hrefName}
      onClick={() => {
        setTimeout(() => {
          setToggle(false);
        }, 200);
      }}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--brand-hover)] transition-colors text-gray-700`}
    >
      {icon}
      <span className={linkClassName}>{title}</span>
    </Link>
  );
};
