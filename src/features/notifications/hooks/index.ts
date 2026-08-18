import { keepPreviousData,useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import type { BroadcastDraftInput,BroadcastFilters,ScheduleBroadcastInput,SendBroadcastInput,TemplateUpdateInput } from '../types';
import { playNotificationChime } from '../services/notification-sound';
import { cancelBroadcast,createBroadcastDraft,duplicateBroadcast,estimateNotificationAudience,getBroadcastNotification,getBroadcastNotifications,getNotificationSummary,getNotificationTargetSources,getNotificationTemplate,getNotificationTemplates,scheduleBroadcast,scheduleExistingBroadcast,sendBroadcast,sendExistingBroadcast,updateNotificationTemplate } from '../services/notifications.mock';
export const notificationKeys={all:['notifications'] as const,list:(f:BroadcastFilters)=>['notifications','broadcasts',f] as const,detail:(id:string)=>['notifications','broadcast',id] as const,summary:['notifications','summary'] as const,templates:['notifications','templates'] as const,template:(key:string)=>['notifications','template',key] as const,targets:['notifications','targets'] as const,audience:(serialized:string)=>['notifications','audience',serialized] as const};
export const useBroadcastNotifications=(f:BroadcastFilters)=>useQuery({queryKey:notificationKeys.list(f),queryFn:()=>getBroadcastNotifications(f),placeholderData:keepPreviousData});
export const useBroadcastNotification=(id:string)=>useQuery({queryKey:notificationKeys.detail(id),queryFn:()=>getBroadcastNotification(id),enabled:Boolean(id)});
export const useNotificationSummary=()=>useQuery({queryKey:notificationKeys.summary,queryFn:getNotificationSummary});
export const useNotificationTemplates=()=>useQuery({queryKey:notificationKeys.templates,queryFn:getNotificationTemplates});
export const useNotificationTemplate=(key:string)=>useQuery({queryKey:notificationKeys.template(key),queryFn:()=>getNotificationTemplate(key),enabled:Boolean(key)});
export const useNotificationTargets=()=>useQuery({queryKey:notificationKeys.targets,queryFn:getNotificationTargetSources});
export function useAudienceEstimate(audience:BroadcastDraftInput['audience']){const serialized=JSON.stringify(audience);return useQuery({queryKey:notificationKeys.audience(serialized),queryFn:()=>estimateNotificationAudience(audience),staleTime:20_000});}
function actor(){const{session}=useSession();if(!session)throw new Error('SESSION_REQUIRED');return session;}
function useInvalidate(){const client=useQueryClient();return async(id?:string)=>{await Promise.all([client.invalidateQueries({queryKey:notificationKeys.all}),id?client.invalidateQueries({queryKey:notificationKeys.detail(id)}):Promise.resolve()]);};}
export function useCreateBroadcast(){const a=actor(),done=useInvalidate();return useMutation({mutationFn:(input:BroadcastDraftInput)=>createBroadcastDraft(input,a),onSuccess:()=>done()});}
export function useSendBroadcast(){const a=actor(),done=useInvalidate();return useMutation({mutationFn:(input:SendBroadcastInput)=>sendBroadcast(input,a),onSuccess:()=>{playNotificationChime();return done();}});}
export function useScheduleBroadcast(){const a=actor(),done=useInvalidate();return useMutation({mutationFn:(input:ScheduleBroadcastInput)=>scheduleBroadcast(input,a),onSuccess:()=>done()});}
export function useSendExistingBroadcast(id:string){const a=actor(),done=useInvalidate();return useMutation({mutationFn:()=>sendExistingBroadcast(id,a),onSuccess:()=>{playNotificationChime();return done(id);}});}
export function useScheduleExistingBroadcast(id:string){const a=actor(),done=useInvalidate();return useMutation({mutationFn:(scheduledAt:string)=>scheduleExistingBroadcast(id,scheduledAt,a),onSuccess:()=>done(id)});}
export function useCancelBroadcast(id:string){const a=actor(),done=useInvalidate();return useMutation({mutationFn:()=>cancelBroadcast(id,a),onSuccess:()=>done(id)});}
export function useDuplicateBroadcast(id:string){const a=actor(),done=useInvalidate();return useMutation({mutationFn:()=>duplicateBroadcast(id,a),onSuccess:()=>done()});}
export function useUpdateNotificationTemplate(key:string){const client=useQueryClient();return useMutation({mutationFn:(input:TemplateUpdateInput)=>updateNotificationTemplate(key,input),onSuccess:async()=>{await Promise.all([client.invalidateQueries({queryKey:notificationKeys.templates}),client.invalidateQueries({queryKey:notificationKeys.template(key)}),client.invalidateQueries({queryKey:notificationKeys.summary})]);}});}
