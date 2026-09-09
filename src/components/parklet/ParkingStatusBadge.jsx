import {
  getParkingStatusLabel,
  getParkingStatusStyle,
} from '@/lib/parkletAdmin.mjs';

export default function ParkingStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getParkingStatusStyle(status)}`}>
      {getParkingStatusLabel(status)}
    </span>
  );
}
