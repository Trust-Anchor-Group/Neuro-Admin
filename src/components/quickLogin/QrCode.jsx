'use client';
import React, {useEffect, useRef, useState} from 'react';
import {fetchQrCode} from "@/utils/quickLogin";
import {updateServiceIdSession} from "@/utils/quickLogin";

export default function QrCode({initialQrCodeUrl, service, serviceId, sessionId, tabId}) {
const [user, setUser] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(initialQrCodeUrl);
  const timeoutSessionRef = useRef(null);
  const timeoutNewQrCodeRef = useRef(null)

  /**
   * =================================================================================================
   * @desc Handles the QR code requests
   * =================================================================================================
   */
  const updateQrCode = async () => {
    const timeoutMilliseconds = 2000;
    try {
      setQrCodeUrl(await fetchQrCode({serviceId, tabId, sessionId}));
      timeoutNewQrCodeRef.current =  setTimeout(updateQrCode, timeoutMilliseconds);
    } catch (error){
      console.log('Error fetching QR code', error);
      timeoutNewQrCodeRef.current = setTimeout(updateQrCode, timeoutMilliseconds);
    }
  }

  /**
   * =================================================================================================
   * @desc Handles the session update request
   * =================================================================================================
   */
  const updateSession = () => {
    const timeoutMilliseconds = 240000; // 4 minutes

    timeoutSessionRef.current = setTimeout(async () => {
      try {
        await updateServiceIdSession({service, sessionId, serviceId});
      } catch (error){
        console.log('Error refreshing QR code session', error);
      }
      updateSession();
    }, timeoutMilliseconds);

  };


  /**
   * =================================================================================================
   * @desc Manages periodic QR code fetching and session updates when `serviceId` is set.
   * =================================================================================================
   */

  useEffect(() => {
    if (serviceId) {
      updateQrCode();
      updateSession();

      return () => {
        clearTimeout(timeoutNewQrCodeRef.current);  // Clear QR code timeout
        clearTimeout(timeoutSessionRef.current);    // Clear session timeout
      };
    }
  }, [serviceId]);

  const fetchCookie = async () => {
    console.log('Fetching cookie...');
    try {
      const { protocol, origin } = config;
    const url = `${protocol}://${origin}/api/auth/quickLogin/me`;
      const res = await fetch( url, {
        method: 'GET',
        credentials: 'include'
      });
      console.log('RESULT TOKEN:', res);
       const data = await res.json();
      console.log('RESULT DATA:', data);
       setUser(data.identity);
    } catch (error) {
      console.log('Something went wrong...', error);
    }
  }

  /**
   * =================================================================================================
   * @desc Renders a QR code image if `qrCodeUrl` is available.
   * =================================================================================================
   */
  return (
      <>
      {qrCodeUrl && <img src={qrCodeUrl} alt="Neuro-admin QR code for QuickLogin" />};
      <button onClick={() => fetchCookie()}>Fetch!!!</button>
      {user && <p>Welcome, {user.id || "User"}!</p>}
      </>
  )
}
