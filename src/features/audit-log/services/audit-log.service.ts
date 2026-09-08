import { env } from '@/config/env';
import type { AuditFilters } from '../types';
import * as api from './audit-log.api';
import * as mock from './audit-log.mock';
export const getAuditEvents=(f:AuditFilters,s?:AbortSignal)=>env.dataSource==='api'?api.getAuditEvents(f,s):mock.getAuditEvents(f);
export const getAuditEvent=(id:string,s?:AbortSignal)=>env.dataSource==='api'?api.getAuditEvent(id,s):mock.getAuditEvent(id);
export const getAuditSummary=(f:Pick<AuditFilters,'from'|'to'>,s?:AbortSignal)=>env.dataSource==='api'?api.getAuditSummary(f,s):mock.getAuditSummary(f);
export const getAuditFilterOptions=(s?:AbortSignal)=>env.dataSource==='api'?api.getAuditFilterOptions(s):mock.getAuditFilterOptions();
export const getAuditExportEvents=(f:AuditFilters,s?:AbortSignal)=>env.dataSource==='api'?api.getAuditExportEvents(f,s):mock.getAuditExportEvents(f);
