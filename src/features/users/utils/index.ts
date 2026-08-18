import { format,formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { UserFilters } from '../types';
import { safeDate } from '@/lib/runtime-safety';
export const formatUserDate=(value:string)=>{const date=safeDate(value);return date?format(date,'d MMMM yyyy، HH:mm',{locale:ar}):'—';};
export const formatUserRelative=(value:string)=>{const date=safeDate(value);return date?formatDistanceToNow(date,{locale:ar,addSuffix:true}):'—';};
export const hasUserFilters=(f:UserFilters)=>Boolean(f.search||f.accountStatus||f.verificationStatus||f.governorate||f.dateFrom||f.dateTo||f.recentActivity||f.hasReports||f.hasAdoptions||f.hasActiveAdoptions);
