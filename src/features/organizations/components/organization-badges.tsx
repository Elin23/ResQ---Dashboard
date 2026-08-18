import { Badge, StatusBadge } from '@/components/ui';
import type { OrganizationStatus, OrganizationVerificationStatus } from '../types';
import { verificationLabels } from '../constants';
export function OrganizationStatusBadge({status}:{status:OrganizationStatus}){const map={PENDING_VERIFICATION:'organization:PENDING_VERIFICATION',ACTIVE:'organization:ACTIVE',SUSPENDED:'organization:SUSPENDED',REJECTED:'organization:REJECTED'} as const;return <StatusBadge status={map[status]}/>;}
export function VerificationBadge({status}:{status:OrganizationVerificationStatus}){const tone=status==='VERIFIED'?'success':status==='REJECTED'?'critical':status==='IN_REVIEW'||status==='MORE_INFO_REQUIRED'?'pending':'neutral';return <Badge tone={tone}>{verificationLabels[status]}</Badge>;}
