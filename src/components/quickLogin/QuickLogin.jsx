'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AgentAPI from 'agent-api';
import { CircularProgress, Typography } from '@mui/material';

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

  const signatureReceived = useCallback((signatureData) => {
    setSuccess(true);
    if (onLoginSuccess) onLoginSuccess();
     if (signatureData?.Properties && signatureData?.Attachments) {
      const userData = {
        name: `${signatureData.Properties.FIRST} ${signatureData.Properties.LAST}`,
        legalId: signatureData.Id,
        pictureId:signatureData.Attachments[0].Id,
      };

      sessionStorage.setItem("neuroUser", JSON.stringify(userData));
      sessionStorage.setItem('profile',JSON.stringify(signatureData))
    }
  }, [onLoginSuccess]);

  const evaluateEvent = useCallback(async (event) => {
    if (!event?.type) return;

    if (
      event.type === 'SignatureReceived' ||
      event.type === 'SignatureReceivedBE'
    ) {
      signatureReceived(event.data);
      sessionStorage.setItem("signatureReceived", JSON.stringify(event.data));

      AgentAPI.IO.SetHost(neuron, true);
      console.log('[AgentAPI] Host set to', event.data.Domain);

      try {
        const Response = await fetch('/api/auth/quickLogin/token', { method: 'POST', credentials: 'include' });
        console.log(Response)
        if (!Response.ok) {
          console.warn('[QuickLogin] /Account/QuickLogin failed', Response.status);
        } else {
          const json = await Response.json().catch(()=>({}));
          const jwt = json?.jwt 
          if (jwt) {
            try { AgentAPI.Account.AuthenticateJwt?.(jwt); } catch { }
            try { AgentAPI.Account.SaveSessionToken?.(jwt, 3600, 1800); } catch { }
          } else {
            console.warn('[QuickLogin] No JWT in response');
          }
        }
      } catch (err) {
        console.error('[QuickLogin] Error performing Account/QuickLogin', err);
      }
    }
  }, [neuron, signatureReceived]);

  const displayQuickLogin = useCallback(async () => {

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
    const uri = `/api/auth/quickLogin/session`;
    xhttp.open('POST', uri, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.withCredentials = true;
    const body = JSON.stringify({
      agentApiTimeout: 3600,
      serviceId: serviceIdRef.current ,
      tab: TabID,
      mode: 'image',
      purpose,
    });

    xhttp.send(body);
  }, [purpose]);

  useEffect(() => {
    if (!active || !neuron) return undefined;

    // WebSocket accepts ws/wss schemes only. The Agent endpoint is HTTPS, so
    // use its secure WebSocket equivalent.
    const host = neuron.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const uri = `wss://${host}/ClientEventsWS`;
    let socket;
    let pingTimer;
    let reconnectTimer;
    let disposed = false;

    const clearPingTimer = () => {
      if (pingTimer) {
        window.clearInterval(pingTimer);
        pingTimer = undefined;
      }
    };

    const connect = () => {
      if (disposed) return;

      socket = new WebSocket(uri, ['ls']);

      socket.onopen = () => {
        socket.send(JSON.stringify({ cmd: 'Register', tabId, location: window.location.href }));
        clearPingTimer();
        pingTimer = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ cmd: 'Ping' }));
          }
        }, 10_000);
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
        // Browsers do not expose useful error details here; onclose schedules
        // a single reconnect attempt and avoids duplicate reconnects.
        clearPingTimer();
      };

      socket.onclose = () => {
        clearPingTimer();
        if (!disposed && !reconnectTimer) {
          reconnectTimer = window.setTimeout(() => {
            reconnectTimer = undefined;
            connect();
          }, 5_000);
        }
      };
    };

    connect();
    displayQuickLogin();
    const displayInterval = window.setInterval(displayQuickLogin, 2_000);

    return () => {
      disposed = true;
      window.clearInterval(displayInterval);
      clearPingTimer();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ cmd: 'Unregister' }));
      }
      socket?.close();
    };
  }, [active, displayQuickLogin, evaluateEvent, neuron, tabId]);

  return (
    <>
      {tagSign ? (
        !success ? (
          <div className="quick-login-container">
            <img
              src={`${window.location.protocol}//${neuron}/QR/${tagSign}`}
              alt="QR Code"
              className='rounded-2xl'
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
