import {
  getOrganizationStatusLabel,
  getOrganizationStatusStyle,
} from '@/lib/parkletAdmin.mjs';

export default function OrganizationStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrganizationStatusStyle(status)}`}
    >
      {getOrganizationStatusLabel(status)}
    </span>
  );
}
