"use client";
import { useState } from 'react';
import { fetchTokensClientSide } from './tokenFetch';

export default function TokensFetcher() {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState(null);

  async function handleFetch() {
    try {
      const data = await fetchTokensClientSide();
      setTokens(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <button onClick={handleFetch}>Fetch Tokens</button>
      {error && <p>Error: {error}</p>}
      <ul>
        {tokens.map((token) => (
          <li key={token.tokenId}>{token.friendlyName}</li>
        ))}
      </ul>
    </div>
  );
}
