import { format, formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { FeedingPointFilters } from '../types';
import { safeDate } from '@/lib/runtime-safety';
export const formatFeedingPointDate=(value:string)=>{const date=safeDate(value);return date?format(date,'d MMM yyyy، HH:mm',{locale:ar}):'—';};
export const formatFeedingPointRelative=(value:string)=>{const date=safeDate(value);return date?formatDistanceToNowStrict(date,{addSuffix:true,locale:ar}):'—';};
export const hasFeedingPointFilters=(f:FeedingPointFilters)=>Boolean(f.search||f.status||f.governorate||f.creatorType||f.organizationId||f.pendingRefills!==undefined||f.hasOpenIssues!==undefined||f.updatedFrom||f.updatedTo);
