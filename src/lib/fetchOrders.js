export async function fetchOrders() {
  try {
    // Build cookie header differently depending on environment (server vs client)
    let cookieHeader = '';
    if (typeof window === 'undefined') {
      try {
        const mod = await import('next/headers');
        const serverCookies = await mod.cookies();
        cookieHeader = serverCookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
      } catch (e) {
        // ignore if not available
      }
    } else if (typeof document !== 'undefined') {
      cookieHeader = document.cookie || '';
    }

  const url = "/api/tokens";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
      },
      body: JSON.stringify({
        maxCount: 100, 
        offset: 0,
      }),
      cache: "no-store",
      credentials: "include", 
    });

    if (!response.ok) {
      throw new Error(`Error fetching orders: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched Orders:", data);

    const formattedOrders = data.data.map((token) => ({
      id: token.tokenId, 
      category: token.category,
      assetName: token.friendlyName,
      orderDate: token.createdDate,
      amount: `${token.value} ${token.currency}`,
      status: "pending",
    }));

    return { orders: formattedOrders, loading: false };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], loading: false, error: true };
  }
}
