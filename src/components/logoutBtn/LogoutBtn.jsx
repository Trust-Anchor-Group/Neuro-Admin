'use client';

import { useRouter } from 'next/navigation';

export default function LogoutBtn({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/api/auth/logout');
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      {children}
    </button>
  );
}
