import { Badge } from '@/components/ui';

import { reportStatusLabels } from '../constants';
import type { ReportStatus } from '../types';

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  // Map report workflow states to a simple visual tone.
  const tone =
    status === 'RECEIVED'
      ? 'success'
      : status === 'CLOSED'
        ? 'neutral'
        : 'pending';

  return (
    <Badge tone={tone}>
      {reportStatusLabels[status]}
    </Badge>
  );
}