import Link from 'next/link';
import React from 'react';

export const LinkToPage = ({ hrefName, title, handleLogout, icon, setToggle }) => {
  const isLogout = !!handleLogout;

  if (isLogout) {
    return (
      <button
        onClick={async () => {
          await handleLogout();
          setToggle(false);
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors"
      >
        {icon}
        <span>{title}</span>
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
      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 transition-colors"
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};
