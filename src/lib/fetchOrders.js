import { cookies } from "next/headers"; 
export async function fetchOrders() {
  try {
    const clientCookies = await cookies(); 

      const url = `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_ORIGIN}/api/tokens`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": clientCookies.toString(), 
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
    return { orders: [], loading: true };
  }
}
