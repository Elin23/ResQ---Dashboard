import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { dashboardKeys } from '@/features/dashboard/hooks';
import { organizationKeys } from '@/features/organizations/hooks';
import { userKeys } from '@/features/users/hooks';
import type { DeactivateFeedingPointInput, FeedingPointFilters, RejectFeedingPointInput, RejectIssueInput, ResolveIssueInput, ReviewRefillInput } from '../types';
import { addFeedingPointNote, approveFeedingPoint, deactivateFeedingPoint, getFeedingPointById, getFeedingPoints, getFeedingPointSummary, reactivateFeedingPoint, rejectFeedingPoint, rejectIssue, resolveIssue, reviewFeedingPointRefill, startIssueReview } from '../services/feeding-points.mock';

export const feedingPointKeys = { all:['feeding-points'] as const, lists:()=>['feeding-points','list'] as const, list:(filters:FeedingPointFilters)=>['feeding-points','list',filters] as const, summary:()=>['feeding-points','summary'] as const, detail:(id:string)=>['feeding-points','detail',id] as const };
export const useFeedingPoints=(filters:FeedingPointFilters)=>useQuery({queryKey:feedingPointKeys.list(filters),queryFn:()=>getFeedingPoints(filters),placeholderData:keepPreviousData});
export const useFeedingPointSummary=()=>useQuery({queryKey:feedingPointKeys.summary(),queryFn:getFeedingPointSummary});
export const useFeedingPoint=(id:string)=>useQuery({queryKey:feedingPointKeys.detail(id),queryFn:()=>getFeedingPointById(id),enabled:Boolean(id)});
function useActor(){const{session}=useSession();if(!session)throw new Error('SESSION_REQUIRED');return session;}
function useInvalidate(id?:string){const client=useQueryClient();return async()=>{await Promise.all([client.invalidateQueries({queryKey:feedingPointKeys.all}),client.invalidateQueries({queryKey:dashboardKeys.all}),client.invalidateQueries({queryKey:organizationKeys.all}),client.invalidateQueries({queryKey:userKeys.all}),...(id?[client.invalidateQueries({queryKey:feedingPointKeys.detail(id)})]:[])]);};}
export function useApproveFeedingPoint(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:()=>approveFeedingPoint(id,actor),onSuccess:invalidate});}
export function useRejectFeedingPoint(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:(input:RejectFeedingPointInput)=>rejectFeedingPoint(id,input,actor),onSuccess:invalidate});}
export function useDeactivateFeedingPoint(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:(input:DeactivateFeedingPointInput)=>deactivateFeedingPoint(id,input,actor),onSuccess:invalidate});}
export function useReactivateFeedingPoint(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:()=>reactivateFeedingPoint(id,actor),onSuccess:invalidate});}
export function useReviewFeedingPointRefill(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:({refillId,input}:{refillId:string;input:ReviewRefillInput})=>reviewFeedingPointRefill(id,refillId,input,actor),onSuccess:invalidate});}
export function useStartFeedingPointIssueReview(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:(issueId:string)=>startIssueReview(id,issueId,actor),onSuccess:invalidate});}
export function useResolveFeedingPointIssue(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:({issueId,input}:{issueId:string;input:ResolveIssueInput})=>resolveIssue(id,issueId,input,actor),onSuccess:invalidate});}
export function useRejectFeedingPointIssue(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:({issueId,input}:{issueId:string;input:RejectIssueInput})=>rejectIssue(id,issueId,input,actor),onSuccess:invalidate});}
export function useAddFeedingPointNote(id:string){const actor=useActor(),invalidate=useInvalidate(id);return useMutation({mutationFn:(note:string)=>addFeedingPointNote(id,note,actor),onSuccess:invalidate});}
