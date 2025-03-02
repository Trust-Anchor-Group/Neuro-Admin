export async function fetchOrders() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/getTokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxCount: 100, 
        offset: 0,
      }),
      cache: "no-store", 
    });

    if (!response.ok) {
      throw new Error(`Error fetching orders: ${response.statusText}`);
    }

    const data = await response.json();

    const formattedOrders = data.data.map((token) => ({
      id: token.tokenId, 
      category: token.category,
      orderDate: token.createdDate,
      amount: `${token.value} ${token.currency}`,
      status: "pending", 
    }));

    return { orders: formattedOrders, loading: false };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], loading: true };
  }
}
