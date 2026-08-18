export const rescueMissionStatuses = ['ASSIGNED','ACCEPTED','ON_THE_WAY','ARRIVED','RESCUING','TRANSPORTING','COMPLETED','CANCELLED'] as const;
export type RescueMissionStatus = (typeof rescueMissionStatuses)[number];
export const rescueMissionPriorities = ['LOW','MEDIUM','HIGH','CRITICAL'] as const;
export type RescueMissionPriority = (typeof rescueMissionPriorities)[number];
