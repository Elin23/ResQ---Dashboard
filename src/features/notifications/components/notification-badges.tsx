import { StatusBadge } from '@/components/ui';
import type { NotificationDeliveryStatus } from '../types';
export function NotificationStatusBadge({status}:{status:NotificationDeliveryStatus}){return <StatusBadge status={`notification:${status}`}/>;}
