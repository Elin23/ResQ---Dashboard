export const notificationChannels = ['IN_APP', 'PUSH'] as const;

export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationDeliveryStatuses = [
  'DRAFT',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'PARTIALLY_SENT',
  'FAILED',
  'CANCELLED',
] as const;

export type NotificationDeliveryStatus = (typeof notificationDeliveryStatuses)[number];

export type NotificationAudienceUserType = 'USER' | 'ORGANIZATION';

export interface NotificationAudience {
  everyone: boolean;
  userTypes?: NotificationAudienceUserType[];
  governorates?: string[];
  organizationIds?: string[];
  userIds?: string[];
}

export interface NotificationDeliveryStatistics {
  targetedCount: number;
  sentCount?: number;
  failedCount?: number;
  openedCount?: number;
  mockData?: boolean;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  audience: NotificationAudience;
  deepLink?: string;
  imageUrl?: string;
  status: NotificationDeliveryStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: {
    id: string;
    name: string;
  };
  statistics?: NotificationDeliveryStatistics;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  actor?: string;
  detail?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface NotificationTemplateVariable {
  key: string;
  label: string;
  example: string;
}

export interface SystemNotificationTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  enabled: boolean;
  required: boolean;
  availableVariables: NotificationTemplateVariable[];
  updatedAt: string;
}

// Details include both the broadcast itself and its operational context.
export interface BroadcastDetails {
  broadcast: BroadcastNotification;
  timeline: NotificationTimelineEvent[];
  audienceSummary: string;
  estimatedAudience: number;
}

export interface BroadcastFilters {
  search: string;
  status?: NotificationDeliveryStatus;
  channel?: NotificationChannel;
  audienceType?: NotificationAudienceUserType | 'EVERYONE';
  creator?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'scheduledAt' | 'sentAt';
  sortDirection?: 'asc' | 'desc';
}

export interface BroadcastListResult {
  items: BroadcastNotification[];
  total: number;
  pageCount: number;
}

export interface NotificationSummary {
  scheduled: number;
  sentToday: number;
  partiallySent: number;
  drafts: number;
  activeTemplates: number;
}

export interface BroadcastDraftInput {
  title: string;
  body: string;
  channels: NotificationChannel[];
  audience: NotificationAudience;
  deepLink?: string;
  imageUrl?: string;
}

export interface ScheduleBroadcastInput extends BroadcastDraftInput {
  scheduledAt: string;
}

// Sending immediately uses the same payload as a broadcast draft.
export interface SendBroadcastInput extends BroadcastDraftInput {}

export interface TemplateUpdateInput {
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  enabled: boolean;
}