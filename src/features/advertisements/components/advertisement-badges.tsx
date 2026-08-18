import { Badge } from '@/components/ui';
import { advertisementStatusLabels } from '../constants';
import type { AdvertisementStatus } from '../types';
export function AdvertisementStatusBadge({ status }: { status: AdvertisementStatus }) { const tone = status === 'ACTIVE' ? 'success' : status === 'PAUSED' || status === 'DRAFT' || status === 'SCHEDULED' ? 'pending' : status === 'DELETED' || status === 'REJECTED' ? 'critical' : 'neutral'; return <Badge tone={tone}>{advertisementStatusLabels[status]}</Badge>; }
