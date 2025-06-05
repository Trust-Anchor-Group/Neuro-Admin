
export async function fetchTokensClientSide(maxCount = 10, offset = 0) {
  const response = await fetch('/api/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxCount, offset }),
    credentials: 'include', 
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

