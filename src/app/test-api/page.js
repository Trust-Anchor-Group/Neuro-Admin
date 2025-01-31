"use client";

import { useEffect, useState } from "react";

export default function TestApiPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTestApi() {
      try {
        const response = await fetch("/api/auth/test"); // Call our test API route
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchTestApi();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>API Test Page</h1>
      {data ? (
        <div>
          <h2>✅ API Response:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : error ? (
        <div style={{ color: "red" }}>
          <h2>❌ API Request Failed</h2>
          <p>{error}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
