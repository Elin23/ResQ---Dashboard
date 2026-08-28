import { Badge, StatusBadge } from '@/components/ui';
import type { SemanticStatus } from '@/lib/statuses';

import type {
  AdoptionApplicationStatus,
  AdoptionPublisherType,
  AdoptionRequestStatus,
} from '../types';

import {
  adoptionApplicationStatusLabels,
  adoptionPublisherTypeLabels,
} from '../constants';

// Connect adoption statuses with the shared semantic status system.
const semantic: Record<AdoptionRequestStatus, SemanticStatus> = {
  PENDING_REVIEW: 'adoption:PENDING_REVIEW',
  PUBLISHED: 'adoption:PUBLISHED',
  REJECTED: 'adoption:REJECTED',
  ADOPTED: 'adoption:ADOPTED',
};

export const AdoptionStatusBadge = ({
  status,
}: {
  status: AdoptionRequestStatus;
}) => (
  <StatusBadge status={semantic[status]} />
);

export const AdoptionApplicationStatusBadge = ({
  status,
}: {
  status: AdoptionApplicationStatus;
}) => (
  <Badge
    tone={
      status === 'ACCEPTED'
        ? 'success'
        : status === 'REJECTED'
          ? 'critical'
          : status === 'WITHDRAWN'
            ? 'neutral'
            : 'pending'
    }
  >
    {adoptionApplicationStatusLabels[status]}
  </Badge>
);

export const AdoptionPublisherBadge = ({
  type,
}: {
  type: AdoptionPublisherType;
}) => (
  <Badge tone={type === 'ORGANIZATION' ? 'info' : 'neutral'}>
    {adoptionPublisherTypeLabels[type]}
  </Badge>
);