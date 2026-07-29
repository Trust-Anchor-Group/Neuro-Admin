'use client';

import { ThemeProvider } from '@mui/material';
import APIKeys from '@/components/settings/apiKey/APIKeys';
import { theme } from '@/components/access/accountTableList';

export default function TrustServicesAPIKeysPage() {
  return (
    <div className="min-h-[calc(100vh-63px)] bg-[#f3f4f6] p-6">
      <ThemeProvider theme={theme}>
        <APIKeys detailsInModal />
      </ThemeProvider>
    </div>
  );
}
