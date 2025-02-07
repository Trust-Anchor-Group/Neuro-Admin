"use client"

import { useEffect, useState } from "react";
import AgentAPI from "agent-api";
import { CircularProgress, Typography } from "@mui/material";
import config from '@/config/config';

function CreateGUID() {
  function Segment() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return Segment() + Segment() + '-' + Segment() + '-' + Segment() + '-' + Segment() + '-' + Segment() + Segment() + Segment();
}
var TabID
try {
  if (window.name.length === 36)
    TabID = window.name;
  else
    TabID = window.name = CreateGUID();
}
catch (e) {
  TabID = CreateGUID();
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export default function QuickLogin({ neuron, purpose, active, onLoginSuccess }) {
  const [tagSign, setTagSign] = useState();
  const [tabId, setTabId] = useState(TabID);
  const [success, setSuccess] = useState(false);
  const [serviceId, setServiceId] = useState("");

  useEffect(() => {
    setTabId(TabID);
  }, [TabID]);


  let displayInterval = null;
  let resetInterval = null;

  const webScocketEventHandler = () => {
    const protocol = "https:";
    const uri = `${protocol}//${neuron}/ClientEventsWS`;

    let socket = new WebSocket(uri, ["ls"]);
    let pingTimer = null;
    let closed = false;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          cmd: "Register",
          tabId: tabId,
          location: window.location.href,
        })
      );

      pingTimer = window.setInterval(() => {
        if (!socket) return;
        if (socket.readyState === socket.OPEN) {
          socket.send(
            JSON.stringify({
              cmd: "Ping",
            })
          );
        } else {
          if (pingTimer) {
            window.clearInterval(pingTimer);
            pingTimer = null;
          }
          if (!closed) {
            window.setTimeout(() => {
              // ask about this
              webScocketEventHandler();
            }, 5000);
          }
        }
      }, 10 * 1000);

      window.onbeforeunload = () => {
        if (socket && socket.readyState === socket.OPEN) {
          window.clearInterval(pingTimer);
          pingTimer = null;

          socket.send(
            JSON.stringify({
              cmd: "Unregister",
            })
          );

          socket.close(1000, "Page closed.");
          //eslint-disable-next-line
          socket = null;
        }

        closed = true;
      };
    };

    socket.onmessage = (event) => {
      if (event.data === null || event.data === "") return;

      try {
        evaluateEvent(JSON.parse(event.data));
      } catch (err) {
        console.log(event.data);
        console.error(err);
      }
    };

    socket.onerror = () => {
      if (pingTimer) {
        window.clearInterval(pingTimer);
        pingTimer = null;
      }

      if (!closed) {
        if (!closed) {
          window.setTimeout(() => {
            // ask about this
            webScocketEventHandler();
          }, 5000);
        }
      }
    };
  };


  const xhttpEventHandler = () => {
    let needsReload = false;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
          if (needsReload) {
            return window.location.reload(false);
          }

          try {
            if (xhttp.responseText) {
              const events = JSON.parse(xhttp.responseText);
              events.forEach((event) => {
                evaluateEvent(event);
              });
            }
          } catch (err) {
            console.log(xhttp.responseText);
            console.error(err);
          } finally {
            //eslint-disable-next-line
            if (false) {
              // event checking?
              xhttp.open("POST", "/ClientEvents", true);
              xhttp.setRequestHeader("Content-Type", "text/plain");
              xhttp.setRequestHeader("X-TabID", tabId);
              xhttp.send(window.location.href);
            }
          }
        } else {
          //eslint-disable-next-line
          if (false) {
            // event checking?
            window.setTimeout(function () {
              needsReload = true;
              xhttp.open("POST", "/ClientEvents", true);
              xhttp.setRequestHeader("Content-Type", "text/plain");
              xhttp.setRequestHeader("X-TabID", tabId);
              xhttp.send(window.location.href);
            }, 5000);
          }
        }
      }
    };
  };

  const signatureRecived = (signatureRecived) => {
    setSuccess(true);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const evaluateEvent = (event) => {
    if (event && event.type.match(/^[a-zA-Z0-9]+$/g)) {
      try {
        console.log(event.type);
        console.log(event.data);
        if (event.type === "SignatureReceived") {
          signatureRecived(event.data);
        } else if (event.type === "SignatureReceivedBE") {
          signatureRecived(event.data);
          AgentAPI.IO.SetHost(event.data.Domain, true);
          AgentAPI.Account.SaveSessionToken(
            event.data.AgentApiToken,
            3600,
            1800
          );
          AgentAPI.Account.AuthenticateJwt(event.data.AgentApiToken);
        } else if (event.type === "CheckServerInstance") {
          console.log(event.data);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const displayQuickLogin = async () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        try {
          const response = JSON.parse(xhttp.responseText);
          console.log('DATA FROM ENDPOINT', response);
          setTagSign(response.data.signUrl);
          let serviceIdValue = window.localStorage.getItem("serviceId")
          if (serviceIdValue === null || serviceIdValue === "") {
            window.localStorage.setItem("serviceId", response.data.serviceId);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    const uri = `${config.protocol}://${config.origin}/api/auth/quickLogin/session`;
    xhttp.open("POST", uri);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.withCredentials = true;
    let serviceIdValue = window.localStorage.getItem("serviceId")
      xhttp.send(
        JSON.stringify({
          agentApiTimeout: 1000,
          serviceId: window.localStorage.getItem("serviceId"),
          tab: TabID,
          mode: "image",
          purpose: purpose,
        })
      );
  };

  useEffect(() => {
    try {
      if ("WebSocket" in window) {
        webScocketEventHandler(tabId);
      }
    } catch (e) {
      // Try fallback mechanism
    }
    xhttpEventHandler(tabId);
  }, []);

  useEffect(() => {
    displayQuickLogin();

    displayInterval = setInterval(() => {
      if (active) {
        displayQuickLogin();
      }
    }, 2000);

    return () => {
      clearInterval(displayInterval);
      displayInterval = null;
    };
  }, [active]);

  useEffect(() => {
    timeServiceId();

    resetInterval = setInterval(() => {
      if (active) {
        timeServiceId();
      }
    }, 180000);

    return () => {
      clearInterval(resetInterval);
      resetInterval = null;
    };
  }, [active]);

  const timeServiceId = async () => {
    window.localStorage.setItem("serviceId", "");
  };

  return (
    <>
      {tagSign ? (
        !success ? (
          <div className="quick-login-container">
            <img src={`${window.location.protocol}//${neuron}/QR/${tagSign}`} />
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
            Loading the QR code
          </Typography>
        </div>
      )}
    </>
  );
}
