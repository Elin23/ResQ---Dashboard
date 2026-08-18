import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getFinanceAnalytics } from '../services/analytics.mock';
import { getSupplementalManagementReports } from '../services/management-reports.mock';
import type { AnalyticsFilters } from '../types';
export const analyticsKeys={
  all:['analytics'] as const,
  view:(filters:AnalyticsFilters,mode:'OPERATIONS'|'FINANCE',includeSupport:boolean)=>['analytics',mode,includeSupport,filters] as const,
  managementReports:(filters:AnalyticsFilters,includeAdvertisements:boolean,includeSupport:boolean)=>['analytics','management-reports',includeAdvertisements,includeSupport,filters] as const,
};
export function useAnalytics(filters:AnalyticsFilters,mode:'OPERATIONS'|'FINANCE',includeSupport:boolean){return useQuery({queryKey:analyticsKeys.view(filters,mode,includeSupport),queryFn:()=>mode==='FINANCE'?getFinanceAnalytics(filters):getAnalytics(filters,true,includeSupport),staleTime:60_000});}
export function useSupplementalManagementReports(filters:AnalyticsFilters,includeAdvertisements:boolean,includeSupport:boolean){return useQuery({queryKey:analyticsKeys.managementReports(filters,includeAdvertisements,includeSupport),queryFn:()=>getSupplementalManagementReports(filters,{includeAdvertisements,includeSupport}),staleTime:60_000});}
