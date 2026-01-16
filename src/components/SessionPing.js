"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function InactivityModal({ countdown, onContinue, onLogout }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Session Expiring</h2>
        <p className="mb-6 text-gray-700">
          You have been inactive. You will be logged out in <span className="font-semibold text-purple-700">{countdown}</span> seconds.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={onContinue} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">Continue</button>
          <button onClick={onLogout} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default function SessionPing() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inactivityTimeoutRef = useRef();
  const countdownIntervalRef = useRef();

  // Ping session to backend
  const pingSession = async () => {
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: '{}',
      });

      if (!response.ok) {
        if (response.status === 403) {
          setShowModal(false);
          setCountdown(60);
          clearInterval(countdownIntervalRef.current);
          router.push('/login');
        }
        return;
      }
    } catch (error) {
      // Optionally handle error
    }
  };


  // Reset inactivity timer (do nothing if modal is open)
  const resetInactivityTimer = () => {
    if (showModal) return;
    clearTimeout(inactivityTimeoutRef.current);
    setShowModal(false);
    setCountdown(60);
    inactivityTimeoutRef.current = setTimeout(() => {
      setShowModal(true);
    }, 25 * 60 * 1000); // 25 min inactivity
  };

  // Countdown effect for modal
  useEffect(() => {
    if (showModal) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
      setCountdown(60);
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, [showModal]);

  // Handle continue button
  const handleContinue = () => {
    clearInterval(countdownIntervalRef.current);
    setShowModal(false);
    setCountdown(60);
    resetInactivityTimer();
  };

  // Handle logout button or timer end
  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    clearInterval(countdownIntervalRef.current);
    setShowModal(false);
    setCountdown(60);

    router.push('/login');
  };

  // Listen for user activity and session ping only when modal is not shown
  useEffect(() => {
    let interval;
    if (!showModal) {
      const events = ["mousemove", "keydown", "mousedown", "touchstart"];
      events.forEach(event =>
        window.addEventListener(event, resetInactivityTimer)
      );
      resetInactivityTimer();

      pingSession();
      interval = setInterval(pingSession, 5 * 60 * 1000);

      return () => {
        events.forEach(event =>
          window.removeEventListener(event, resetInactivityTimer)
        );
        clearTimeout(inactivityTimeoutRef.current);
        clearInterval(interval);
      };
    }
    // When modal is open, do not attach listeners or ping session
    return () => {
      clearTimeout(inactivityTimeoutRef.current);
    };
  }, [showModal]);

  return (
    <>
      {showModal && (
        <InactivityModal
          countdown={countdown}
          onContinue={handleContinue}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
