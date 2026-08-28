import { StatusBadge } from '@/components/ui';

import type { NotificationDeliveryStatus } from '../types';

// Reuse the shared status badge styles for notification delivery states.
export function NotificationStatusBadge({ status }: { status: NotificationDeliveryStatus }) {
  return <StatusBadge status={`notification:${status}`} />;
}