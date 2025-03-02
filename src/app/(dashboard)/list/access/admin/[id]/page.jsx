"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ManageIDRequests from "@/components/ManageIDRequests";
import { Container, Box, Typography } from "@mui/material";

export default function AdminPage() {
  const { id } = useParams();
  const [userRequests, setUserRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateForm, setStateForm] = useState({ state: "" });

async function fetchData() {
  try {
    console.log("Fetching data from real API...");

    const res = await fetch(`/api/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }

    const requestData = await res.json();
    console.log("✅ API Response:", requestData);

    setUserRequests(Array.isArray(requestData) ? requestData : [requestData]);
    setError(null);
  } catch (error) {
    console.error("🚨 API Error:", error);
    setUserRequests([]);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function onClickStates() {
    console.log("State Change:", stateForm.state);
    try {
      const res = await fetch(`http://localhost:3000/api/legalIdStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: id,
          state: stateForm.state,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to change state");
      }

      const data = await res.json();
      console.log("State Change Response:", data);
    } catch (error) {
      console.error("🚨 Error changing state:", error);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h3" fontWeight="bold" color="primary">
        </Typography>
      </Box>

      
      {loading && <p>Loading...</p>}

      
      {error && <p style={{ color: "red" }}>⚠ Error: {error}</p>}

      
      {!loading && !error && <ManageIDRequests userRequests={userRequests} />}
    </Container>
  );
}
