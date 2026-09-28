const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ADMIN_CONTRACT_STATUSES = ['NotCreated', 'ContractSent', 'Created'];

export function isAdminOrderId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value.trim());
}

export function getAdminOrderId(order) {
  return String(order?.id ?? order?.order_id ?? order?.orderId ?? order?.orderid ?? order?.Id ?? '').trim();
}

export function getAdminContractStatus(order) {
  const status = String(order?.contract_status ?? order?.contractStatus ?? 'NotCreated');
  return ADMIN_CONTRACT_STATUSES.includes(status) ? status : 'NotCreated';
}

export function getAdminOrderTimestamp(order) {
  return order?.created_at
    ?? order?.createdAt
    ?? order?.created
    ?? order?.order_created_at
    ?? order?.orderCreatedAt
    ?? order?.ordered_at
    ?? order?.orderedAt
    ?? order?.order_date
    ?? order?.orderDate
    ?? order?.timestamp
    ?? order?.created_date
    ?? order?.createdDate
    ?? order?.creation_date
    ?? order?.creationDate
    ?? order?.date
    ?? order?.time
    ?? null;
}

const HISTORY_FIELDS = [
  'contract_status_history',
  'contractStatusHistory',
  'contract_status_events',
  'contractStatusEvents',
  'contract_history',
  'contractHistory',
  'status_history',
  'statusHistory',
];

const TIMESTAMP_FIELDS = [
  'contract_status_timestamps',
  'contractStatusTimestamps',
  'contract_status_history_timestamps',
  'contractStatusHistoryTimestamps',
];

function normalizeHistoryEvent(value, fallbackStatus = '') {
  if (typeof value === 'string') {
    return fallbackStatus
      ? { status: fallbackStatus, timestamp: value || null }
      : { status: value, timestamp: null };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const status = value.contract_status
    ?? value.contractStatus
    ?? value.status
    ?? value.to_status
    ?? value.toStatus
    ?? value.new_status
    ?? value.newStatus
    ?? value.to
    ?? value.value
    ?? fallbackStatus;
  if (typeof status !== 'string' || !status.trim()) return null;

  return {
    status: status.trim(),
    timestamp: value.timestamp
      ?? value.created_at
      ?? value.createdAt
      ?? value.changed_at
      ?? value.changedAt
      ?? value.updated_at
      ?? value.updatedAt
      ?? value.status_timestamp
      ?? value.statusTimestamp
      ?? value.changed_on
      ?? value.changedOn
      ?? value.at
      ?? value.time
      ?? value.date
      ?? null,
  };
}

export function getAdminContractStatusHistory(order) {
  for (const field of HISTORY_FIELDS) {
    const history = order?.[field];
    if (Array.isArray(history)) {
      const events = history
        .map((event) => normalizeHistoryEvent(event))
        .filter((event) => event && ADMIN_CONTRACT_STATUSES.includes(event.status));
      if (events.length) return events;
      continue;
    }
    if (history && typeof history === 'object') {
      const singleEvent = normalizeHistoryEvent(history);
      if (singleEvent) return [singleEvent];

      const events = history.events ?? history.items ?? history.history;
      if (Array.isArray(events)) {
        const normalizedEvents = events
          .map((event) => normalizeHistoryEvent(event))
          .filter((event) => event && ADMIN_CONTRACT_STATUSES.includes(event.status));
        if (normalizedEvents.length) return normalizedEvents;
        continue;
      }
      const normalizedEvents = Object.entries(history)
        .map(([status, value]) => normalizeHistoryEvent(value, status))
        .filter((event) => event && ADMIN_CONTRACT_STATUSES.includes(event.status));
      if (normalizedEvents.length) return normalizedEvents;
    }
  }

  for (const field of TIMESTAMP_FIELDS) {
    const timestamps = order?.[field];
    if (!timestamps || typeof timestamps !== 'object' || Array.isArray(timestamps)) continue;
    return Object.entries(timestamps)
      .map(([status, value]) => ({
        status,
        timestamp: value && typeof value === 'object'
          ? value.timestamp ?? value.created_at ?? value.createdAt ?? value.at ?? null
          : value,
      }))
      .filter((event) => ADMIN_CONTRACT_STATUSES.includes(event.status) && event.timestamp);
  }

  const currentStatusTimestamp = order?.contract_status_updated_at
    ?? order?.contractStatusUpdatedAt
    ?? order?.contract_status_timestamp
    ?? order?.contractStatusTimestamp
    ?? order?.[`${getAdminContractStatus(order).replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}_at`];
  if (currentStatusTimestamp) {
    return [{ status: getAdminContractStatus(order), timestamp: currentStatusTimestamp }];
  }

  return [];
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
