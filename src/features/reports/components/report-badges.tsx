import { Badge } from '@/components/ui';
import type { ReportStatus } from '../types';
import { reportStatusLabels } from '../constants';

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const tone = status === 'RECEIVED' ? 'success' : status === 'CLOSED' ? 'neutral' : 'pending';
  return <Badge tone={tone}>{reportStatusLabels[status]}</Badge>;
}
