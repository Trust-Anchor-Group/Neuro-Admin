'use client';

import { useEffect, useState, useRef } from 'react';
import AgentAPI from 'agent-api';
import { CircularProgress, Typography } from '@mui/material';
import config from '@/config/config';

function CreateGUID() {
  function Segment() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    Segment() +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    '-' +
    Segment() +
    Segment() +
    Segment()
  );
}

var TabID;
try {
  if (window.name.length === 36) TabID = window.name;
  else TabID = window.name = CreateGUID();
} catch (e) {
  TabID = CreateGUID();
}

export default function QuickLogin({
  neuron,
  purpose,
  active,
  onLoginSuccess,
}) {
  const [tagSign, setTagSign] = useState();
  const [tabId, setTabId] = useState(TabID);
  const [success, setSuccess] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const serviceIdRef = useRef(serviceId);

  useEffect(() => {
    serviceIdRef.current = serviceId;
  }, [serviceId]);

  useEffect(() => {
    setTabId(TabID);
  }, []);

  let displayInterval = null;

  const webSocketEventHandler = () => {
    const protocol = 'https:';
    const uri = `${protocol}//${neuron}/ClientEventsWS`;

    let socket = new WebSocket(uri, ['ls']);
    let pingTimer = null;
    let closed = false;

    socket.onopen = () => {
      console.log('[WebSocket] Connected.');
      socket.send(
        JSON.stringify({
          cmd: 'Register',
          tabId: tabId,
          location: window.location.href,
        })
      );

      pingTimer = window.setInterval(() => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify({ cmd: 'Ping' }));
        } else {
          if (pingTimer) clearInterval(pingTimer);
          if (!closed) reconnect();
        }
      }, 10 * 1000);

      window.onbeforeunload = () => {
        if (socket.readyState === socket.OPEN) {
          clearInterval(pingTimer);
          socket.send(JSON.stringify({ cmd: 'Unregister' }));
          socket.close();
        }
        closed = true;
      };
    };

    socket.onmessage = (event) => {
      if (!event.data) return;
      try {
        evaluateEvent(JSON.parse(event.data));
      } catch (err) {
        console.error('[WebSocket] Error parsing message:', event.data, err);
      }
    };

    socket.onerror = () => {
      console.error('[WebSocket] Error.');
      if (pingTimer) clearInterval(pingTimer);
      if (!closed) reconnect();
    };

    const reconnect = () => {
      if (!closed) {
        console.log('[WebSocket] Reconnecting...');
        setTimeout(webSocketEventHandler, 5000);
      }
    };
  };

  const signatureReceived = (signatureData) => {
    console.log('[Login] Successful Signature Received:', signatureData);
    setSuccess(true);
    if (onLoginSuccess) onLoginSuccess();
     if (signatureData?.Properties && signatureData?.Attachments) {
      const userData = {
        name: `${signatureData.Properties.FIRST} ${signatureData.Properties.LAST}`,
        legalId: signatureData.Attachments[0].Id,
      };

      sessionStorage.setItem("neuroUser", JSON.stringify(userData));
    }
  };

  const evaluateEvent = (event) => {
    if (!event?.type) return;

    console.log('[Event] Received:', event.type, event.data);

    if (
      event.type === 'SignatureReceived' ||
      event.type === 'SignatureReceivedBE'
    ) {
      signatureReceived(event.data);

      if (event.type === 'SignatureReceivedBE' && event.data.AgentApiToken) {
        console.log('[AgentAPI] Setting Host and JWT.');
        AgentAPI.IO.SetHost(event.data.Domain, true);
        AgentAPI.Account.SaveSessionToken(event.data.AgentApiToken, 3600, 1800);
        AgentAPI.Account.AuthenticateJwt(event.data.AgentApiToken);
      }
    }
  };

  const displayQuickLogin = async () => {

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        try {
          const response = JSON.parse(xhttp.responseText);
          setTagSign(response.data.signUrl);

          if (!serviceIdRef.current) {
            setServiceId(response.data.serviceId);
          }
        } catch (err) {
          console.error('[QR Fetch] Error parsing response:', err);
        }
      }
    };
    console.log('config.origin:', config.origin); 
    const uri = `/api/auth/quickLogin/session`;
    xhttp.open('POST', uri, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.withCredentials = true;
    xhttp.send(
      JSON.stringify({
        agentApiTimeout: 3600, // Requesting Agent API Token
        serviceId: serviceIdRef.current || '',
        tab: TabID,
        mode: 'image',
        purpose,
      })
    );
  };

  useEffect(() => {
    if (active) {
      webSocketEventHandler();
      displayInterval = setInterval(() => {
        displayQuickLogin();
      }, 2000);
    }

    return () => {
      if (displayInterval) clearInterval(displayInterval);
    };
  }, [active]);

  return (
    <>
      {tagSign ? (
        !success ? (
          <div className="quick-login-container">
            <img
              src={`${window.location.protocol}//${neuron}/QR/${tagSign}`}
              alt="QR Code"
            />
            <Typography
              variant="body2"
              align="center"
              className="quick-login-text"
            >
              Scan QR code to Log In
            </Typography>
          </div>
        ) : null
      ) : (
        <div className="quick-login-container">
          <CircularProgress size={40} />
          <Typography
            variant="body2"
            align="center"
            className="quick-login-text"
          >
            Loading QR code...
          </Typography>
        </div>
      )}
    </>
  );
}
