export const auditActorTypes=['ADMIN','SYSTEM'] as const;
export type AuditActorType=(typeof auditActorTypes)[number];
export const auditResourceTypes=['REPORT','ADOPTION_REQUEST','ORGANIZATION','USER','FEEDING_POINT','DONATION','ADVERTISEMENT','CONTENT','NOTIFICATION','SUPPORT_TICKET','ADMIN','ROLE','SYSTEM_SETTING'] as const;
export type AuditResourceType=(typeof auditResourceTypes)[number];
export const auditActions=['REPORT_VERIFIED','REPORT_REJECTED','REPORT_SEVERITY_CHANGED','REPORT_ASSIGNED','REPORT_CLOSED','REPORT_ORGANIZATION_ASSIGNED','REPORT_ORGANIZATION_CHANGED','REPORT_STATUS_ADMIN_OVERRIDE','REPORT_DELETED','ADOPTION_REVIEW_STARTED','ADOPTION_APPROVED','ADOPTION_REJECTED','ADOPTION_COMPLETED','ORGANIZATION_REVIEW_STARTED','ORGANIZATION_APPROVED','ORGANIZATION_REJECTED','ORGANIZATION_SUSPENDED','ORGANIZATION_REACTIVATED','USER_SUSPENDED','USER_REACTIVATED','USER_BLOCKED','USER_UNBLOCKED','FEEDING_POINT_APPROVED','FEEDING_POINT_REJECTED','FEEDING_POINT_DEACTIVATED','FEEDING_POINT_REFILL_VERIFIED','FEEDING_POINT_REFILL_REJECTED','DONATION_REFUND_RECORDED','ADVERTISEMENT_APPROVED','ADVERTISEMENT_REJECTED','ADVERTISEMENT_PAUSED','ADVERTISEMENT_RESUMED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','NOTIFICATION_SENT','NOTIFICATION_SCHEDULED','NOTIFICATION_CANCELLED','SUPPORT_TICKET_ASSIGNED','SUPPORT_TICKET_RESOLVED','SUPPORT_TICKET_REOPENED','ADMIN_INVITED','ADMIN_SUSPENDED','ADMIN_REACTIVATED','ADMIN_ROLES_UPDATED','ROLE_CREATED','ROLE_UPDATED','ROLE_DELETED','SYSTEM_SETTING_CHANGED','LOOKUP_VALUE_CREATED','LOOKUP_VALUE_UPDATED','ADVERTISEMENT_EXPIRED'] as const;
export type AuditAction=(typeof auditActions)[number];
export type AuditScalar=string|number|boolean|null;
export type AuditValue=AuditScalar|Record<string,AuditScalar>;
export interface AuditMetadata{field?:string;source?:string;note?:string;relatedResourceIds?:string[];override?:boolean;destructive?:boolean}
export interface AuditRequestContext{ipAddress?:string;userAgent?:string;correlationId?:string}
export interface AuditActor{type:AuditActorType;id?:string;name:string;role?:string}
export interface AuditEvent{id:string;actor:AuditActor;action:AuditAction;resource:{type:AuditResourceType;id:string;label?:string};timestamp:string;reason?:string;previousValue?:AuditValue;newValue?:AuditValue;metadata?:AuditMetadata;requestContext?:AuditRequestContext}
export interface AuditFilters{search:string;actorId?:string;actorRole?:string;actorType?:AuditActorType;action?:AuditAction;resourceType?:AuditResourceType;resourceId?:string;from?:string;to?:string;sensitive?:boolean;page:number;pageSize:number;sortDirection:'asc'|'desc'}
export interface AuditListResult{items:AuditEvent[];total:number;page:number;pageSize:number;pageCount:number}
export interface AuditSummary{total:number;today:number;sensitive:number;roleChanges:number;settingsChanges:number}
export interface RecordAuditInput{actor:AuditActor;action:AuditAction;resource:{type:AuditResourceType;id:string;label?:string};reason?:string;previousValue?:AuditValue;newValue?:AuditValue;metadata?:AuditMetadata;requestContext?:AuditRequestContext;timestamp?:string}
