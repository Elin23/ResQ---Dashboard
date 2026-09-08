import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import { supportAssignees } from '../constants';
import type { AssignTicketInput, ChangePriorityInput, EscalateTicketInput, ReplyTicketInput, ReopenTicketInput, ResolveTicketInput, SupportFilters, SupportTicketStatus } from '../types';
import * as api from './support.api';
import * as mock from './support.mock';

export const getSupportTickets=(f:SupportFilters,s?:AbortSignal)=>env.dataSource==='api'?api.getSupportTickets(f,s):mock.getSupportTickets(f);
export const getSupportSummary=(s?:AbortSignal)=>env.dataSource==='api'?api.getSupportSummary(s):mock.getSupportSummary();
export const getSupportTicket=(id:string,s?:AbortSignal)=>env.dataSource==='api'?api.getSupportTicket(id,s):mock.getSupportTicket(id);
export const getUserSupportSummary=(id:string,s?:AbortSignal)=>env.dataSource==='api'?api.getUserSupportSummary(id,s):mock.getUserSupportSummary(id);
export const getSupportCannedResponses=(s?:AbortSignal)=>env.dataSource==='api'?api.getSupportCannedResponses(s):mock.getSupportCannedResponses();
export const getSupportAssignees=(s?:AbortSignal)=>env.dataSource==='api'?api.getSupportAssignees(s):Promise.resolve([...supportAssignees]);

async function afterMockMutation(id:string, mutation:()=>Promise<unknown>){
  await mutation();
  return mock.getSupportTicket(id);
}

export const assignSupportTicket=(id:string,v:AssignTicketInput,a:AdminSession)=>env.dataSource==='api'?api.assignSupportTicket(id,v,a):afterMockMutation(id,()=>mock.assignSupportTicket(id,v,a));
export const changeSupportPriority=(id:string,v:ChangePriorityInput,a:AdminSession)=>env.dataSource==='api'?api.changeSupportPriority(id,v,a):afterMockMutation(id,()=>mock.changeSupportPriority(id,v,a));
export const changeSupportStatus=(id:string,v:SupportTicketStatus,a:AdminSession)=>env.dataSource==='api'?api.changeSupportStatus(id,v,a):afterMockMutation(id,()=>mock.changeSupportStatus(id,v,a));
export const replyToSupportTicket=(id:string,v:ReplyTicketInput,a:AdminSession)=>env.dataSource==='api'?api.replyToSupportTicket(id,v,a):afterMockMutation(id,()=>mock.replyToSupportTicket(id,v,a));
export const addSupportInternalNote=(id:string,v:string,a:AdminSession)=>env.dataSource==='api'?api.addSupportInternalNote(id,v,a):mock.addSupportInternalNote(id,v,a);
export const escalateSupportTicket=(id:string,v:EscalateTicketInput,a:AdminSession)=>env.dataSource==='api'?api.escalateSupportTicket(id,v,a):afterMockMutation(id,()=>mock.escalateSupportTicket(id,v,a));
export const resolveSupportTicket=(id:string,v:ResolveTicketInput,a:AdminSession)=>env.dataSource==='api'?api.resolveSupportTicket(id,v,a):afterMockMutation(id,()=>mock.resolveSupportTicket(id,v,a));
export const closeSupportTicket=(id:string,a:AdminSession)=>env.dataSource==='api'?api.closeSupportTicket(id,a):afterMockMutation(id,()=>mock.closeSupportTicket(id,a));
export const reopenSupportTicket=(id:string,v:ReopenTicketInput,a:AdminSession)=>env.dataSource==='api'?api.reopenSupportTicket(id,v,a):afterMockMutation(id,()=>mock.reopenSupportTicket(id,v,a));
