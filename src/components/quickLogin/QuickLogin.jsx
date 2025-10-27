'use client';

import { useEffect, useState, useRef } from 'react';
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
  };

  const evaluateEvent = async (event) => {
    if (!event?.type) return;


    if (
      event.type === 'SignatureReceived' ||
      event.type === 'SignatureReceivedBE'
    ) {
      signatureReceived(event.data);
      sessionStorage.setItem("signatureReceived", JSON.stringify(event.data));

      // Set host regardless
      AgentAPI.IO.SetHost(neuron, true);
      console.log(
        '[AgentAPI] Host set to', event.data.Domain)
      console.log('[AgentAPI] host env:', neuron);

      // if (event.data.AgentApiToken) {
      //   console.log('[AgentAPI] AgentApiToken received in event. Authenticating directly.');
      //   AgentAPI.Account.SaveSessionToken(event.data.AgentApiToken, 3600, 1800);
      //   AgentAPI.Account.AuthenticateJwt(event.data.AgentApiToken);
      // } else if (event.type === 'SignatureReceivedBE') {
      //   console.log('[QuickLogin] No AgentApiToken in event — calling /Account/QuickLogin fallback');

      //   try {
      //     const res = await fetch('/api/auth/quickLogin/token', {
      //       method: 'POST',
      //       credentials: 'include',
      //     });

      //     if (!res.ok) throw new Error(await res.text());

      //     const { jwt } = await res.json();

      //     AgentAPI.Account.SaveSessionToken(jwt, 3600, 1800);
      //     AgentAPI.Account.AuthenticateJwt(jwt);
      //   } catch (err) {
      //     console.error('[QuickLogin] Fallback token request failed:', err);
      //   }
      // }
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
