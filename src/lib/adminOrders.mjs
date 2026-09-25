const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isAdminOrderId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value.trim());
}

export function getAdminOrderId(order) {
  return String(order?.id ?? order?.order_id ?? order?.orderId ?? order?.orderid ?? order?.Id ?? '').trim();
}

export function isAdminOrderPaid(order) {
  const value = order?.paid ?? order?.is_paid ?? order?.isPaid ?? order?.Paid;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['true', '1', 'paid', 'completed', 'settled'].includes(value.trim().toLowerCase());
  }

  const status = String(order?.payment_status ?? order?.paymentStatus ?? order?.status ?? '').trim().toLowerCase();
  return ['paid', 'completed', 'settled'].includes(status);
}

export function unwrapAdminOrders(payload) {
  const candidates = [
    payload?.data?.data?.data,
    payload?.data?.data?.orders,
    payload?.data?.data?.items,
    payload?.data?.data,
    payload?.data?.orders,
    payload?.data?.items,
    payload?.orders,
    payload?.items,
    payload?.data,
    payload,
  ];

  const orders = candidates.find(Array.isArray) || [];
  return orders.filter((order) => order && typeof order === 'object' && !Array.isArray(order));
}
