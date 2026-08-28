import { Badge, StatusBadge } from '@/components/ui';

import { conditionLabels, foodLevelLabels, refillReviewStatusLabels } from '../constants';
import type { FeedingPointCondition, FeedingPointFoodLevel, FeedingPointStatus, RefillReviewStatus } from '../types';

// Feeding point status uses the shared application status badge.
export const FeedingPointStatusBadge = ({ status }: { status: FeedingPointStatus }) => (
  <StatusBadge status={`feeding-point:${status}`} />
);

// Review status controls the visual tone of refill submissions.
export const RefillStatusBadge = ({ status }: { status: RefillReviewStatus }) => (
  <Badge tone={status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'critical' : 'pending'}>
    {refillReviewStatusLabels[status]}
  </Badge>
);

export const FoodLevelBadge = ({ level }: { level?: FeedingPointFoodLevel }) => (
  <Badge
    tone={
      level === 'EMPTY' || level === 'LOW'
        ? 'pending'
        : level === 'FULL'
          ? 'success'
          : 'neutral'
    }
  >
    {foodLevelLabels[level ?? 'UNKNOWN']}
  </Badge>
);

export const ConditionBadge = ({ condition }: { condition?: FeedingPointCondition }) => (
  <Badge
    tone={
      condition === 'DAMAGED' || condition === 'MISSING'
        ? 'critical'
        : condition === 'NEEDS_CLEANING'
          ? 'pending'
          : condition === 'GOOD'
            ? 'success'
            : 'neutral'
    }
  >
    {conditionLabels[condition ?? 'UNKNOWN']}
  </Badge>
);

// Issue states use stronger tones while the problem still needs attention.
export const IssueStatusBadge = ({ status }: { status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' }) => (
  <Badge
    tone={
      status === 'RESOLVED'
        ? 'success'
        : status === 'REJECTED'
          ? 'neutral'
          : status === 'OPEN'
            ? 'critical'
            : 'pending'
    }
  >
    {status === 'OPEN'
      ? 'مفتوحة'
      : status === 'UNDER_REVIEW'
        ? 'قيد المراجعة'
        : status === 'RESOLVED'
          ? 'تم الحل'
          : 'مرفوضة'}
  </Badge>
);