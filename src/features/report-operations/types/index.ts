export const reportOperationStatuses = ['ASSIGNED','ACCEPTED','ON_THE_WAY','ARRIVED','RESCUING','TRANSPORTING','COMPLETED','CANCELLED'] as const;

export type ReportOperationStatus = (typeof reportOperationStatuses)[number];

export const reportOperationPriorities = ['LOW','MEDIUM','HIGH','CRITICAL'] as const;

// Reuse report severity levels as operational priorities.
export type ReportOperationPriority = (typeof reportOperationPriorities)[number];
