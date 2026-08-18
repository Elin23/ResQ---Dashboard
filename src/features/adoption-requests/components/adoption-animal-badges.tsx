import { Badge } from '@/components/ui';
import { adoptionAnimalAvailabilityLabels, adoptionAnimalHealthLabels } from '../constants';
import type { AdoptionAnimalAvailability, AdoptionAnimalHealthStatus } from '../types';

export function AdoptionAnimalAvailabilityBadge({ status }: { status: AdoptionAnimalAvailability }) {
  const tone = status === 'ADOPTED' ? 'success' : status === 'AVAILABLE' ? 'info' : status === 'RESERVED' ? 'pending' : 'neutral';
  return <Badge tone={tone}>{adoptionAnimalAvailabilityLabels[status]}</Badge>;
}

export function AdoptionAnimalHealthBadge({ status }: { status: AdoptionAnimalHealthStatus }) {
  const tone = status === 'CRITICAL' ? 'critical' : status === 'NEEDS_TREATMENT' ? 'pending' : status === 'HEALTHY' ? 'success' : 'info';
  return <Badge tone={tone}>{adoptionAnimalHealthLabels[status]}</Badge>;
}
