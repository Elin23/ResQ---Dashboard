export const supportTicketStatuses=['NEW','OPEN','WAITING_FOR_USER','WAITING_FOR_INTERNAL','RESOLVED','CLOSED'] as const;
export type SupportTicketStatus=(typeof supportTicketStatuses)[number];
export const supportTicketPriorities=['LOW','NORMAL','HIGH','URGENT'] as const;
export type SupportTicketPriority=(typeof supportTicketPriorities)[number];
export const supportRequesterTypes=['USER','ORGANIZATION'] as const;
export type SupportRequesterType=(typeof supportRequesterTypes)[number];
export const supportTicketCategories=['ACCOUNT','REPORT','ADOPTION','ORGANIZATION','DONATION','ADVERTISEMENT','TECHNICAL','COMPLAINT','OTHER'] as const;
export type SupportTicketCategory=(typeof supportTicketCategories)[number];
export type SupportMessageAuthorType='REQUESTER'|'ADMIN';
export type SupportRelatedResourceType='REPORT'|'ADOPTION_REQUEST'|'ORGANIZATION'|'DONATION'|'ADVERTISEMENT';
export type SupportEscalationTeam='OPERATIONS'|'FINANCE'|'CONTENT'|'ADMIN';
export interface SupportAttachment{id:string;name:string;type:string;size:number;url:string}
export interface SupportMessage{id:string;ticketId:string;authorType:SupportMessageAuthorType;author:{id:string;name:string};body:string;attachments?:SupportAttachment[];createdAt:string}
export interface SupportInternalNote{id:string;ticketId:string;author:{id:string;name:string;role?:string};body:string;createdAt:string}
export interface SupportEscalation{escalated:boolean;escalatedAt?:string;reason?:string;targetTeam?:SupportEscalationTeam}
export interface SupportTimelineEvent{id:string;label:string;actorName?:string;details?:string;createdAt:string}
export interface SupportRequester{type:SupportRequesterType;id:string;name:string;email?:string;phone?:string}
export interface SupportTicket{id:string;subject:string;category:SupportTicketCategory;status:SupportTicketStatus;priority:SupportTicketPriority;requester:SupportRequester;assignee?:{id:string;name:string;role:string};relatedResource?:{type:SupportRelatedResourceType;id:string};messagesCount:number;createdAt:string;updatedAt:string;firstResponseAt?:string;resolvedAt?:string;closedAt?:string;resolutionSummary?:string;escalation?:SupportEscalation}
export interface SupportTicketDetails{ticket:SupportTicket;messages:SupportMessage[];notes:SupportInternalNote[];timeline:SupportTimelineEvent[]}
export interface SupportFilters{search:string;status?:SupportTicketStatus;priority?:SupportTicketPriority;category?:SupportTicketCategory;requesterType?:SupportRequesterType;assignee?:string;unassigned?:boolean;userId?:string;organizationId?:string;dateFrom?:string;dateTo?:string;waiting?:'USER'|'INTERNAL';page:number;pageSize:number;sortBy?:'createdAt'|'updatedAt'|'priority'|'status';sortDirection?:'asc'|'desc'}
export interface SupportListResult{items:SupportTicket[];total:number;page:number;pageSize:number;pageCount:number}
export interface SupportSummary{newCount:number;openCount:number;urgentCount:number;waitingForUser:number;unassigned:number;resolvedToday:number}
export interface SupportCannedResponse{id:string;title:string;body:string;category?:SupportTicketCategory}
export interface AssignTicketInput{assigneeId:string;assigneeName:string;assigneeRole:string}
export interface ChangePriorityInput{priority:SupportTicketPriority;reason?:string}
export interface ReplyTicketInput{body:string;waitForUser:boolean}
export interface EscalateTicketInput{targetTeam:SupportEscalationTeam;reason:string}
export interface ResolveTicketInput{summary:string}
export interface ReopenTicketInput{reason:string}
export interface UserSupportSummary{total:number;open:number;recent:Array<{id:string;subject:string;status:SupportTicketStatus;updatedAt:string}>}
