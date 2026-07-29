'use client';

import SessionPing from '@/components/SessionPing';
import AdminShell from '@/components/shared/AdminShell';
import { Suspense } from 'react';

export default function LandingLayout({ children }) {
  return <><SessionPing /><Suspense fallback={null}><AdminShell>{children}</AdminShell></Suspense></>;
}
