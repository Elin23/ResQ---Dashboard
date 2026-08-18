import { Badge,StatusBadge } from '@/components/ui';
import type { UserAccountStatus,UserVerificationStatus } from '../types';
import { verificationLabels } from '../constants';
export const UserAccountStatusBadge=({status}:{status:UserAccountStatus})=><StatusBadge status={`user:${status}`}/>;
export function UserVerificationBadge({status}:{status:UserVerificationStatus}){const tone=status==='VERIFIED'?'success':status==='PHONE_VERIFIED'?'info':'neutral';return <Badge tone={tone}>{verificationLabels[status]}</Badge>;}
