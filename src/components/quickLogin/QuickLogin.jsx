"use client";
import React, { useEffect } from 'react';
import config from '@/config/config';
import { v4 as uuidv4 } from 'uuid';
import { fetchServiceId, fetchQrCode } from '@/utils/quickLogin';
import QrCode from '@/components/quickLogin/QrCode';

export default function QuickLogin() {
  const service = config.quickLogin.callBackUrl;
  console.log(service);
  console.log(config);

  if (!service.startsWith('https://')) {
    console.error('Misconfigured callback URL: The URL must use HTTPS.');
  }

  const tabId = uuidv4().replaceAll('-', '');
  const sessionId = uuidv4().replaceAll('-', '');

  // Call API in `useEffect` (Client-side)
  const [serviceId, setServiceId] = React.useState(null);
  const [qrCodeUrl, setQrCodeUrl] = React.useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const serviceId = await fetchServiceId({ service, sessionId });
        const qrCodeUrl = await fetchQrCode({ serviceId, tabId });
        setServiceId(serviceId);
        setQrCodeUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error fetching QR code data', error);
      }
    }
    fetchData();
  }, []);

  if (!serviceId || !qrCodeUrl) {
    return <p>Loading QR Code...</p>;
  }

  return <QrCode initialQrCodeUrl={qrCodeUrl} serviceId={serviceId} sessionId={sessionId} tabId={tabId} />;
}
