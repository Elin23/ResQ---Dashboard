import { env } from '@/config/env';
import type { CreateMapListingInput } from '../types';
import * as api from './operational-map.api';
import * as mock from './operational-map.mock';

export const getOperationalMapData = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getOperationalMapData(signal) : mock.getOperationalMapData();
export const createMapListing = (input: CreateMapListingInput) => env.dataSource === 'api' ? api.createMapListing(input) : mock.createMapListing(input);
export const approveMapListing = (id: string) => env.dataSource === 'api' ? api.approveMapListing(id) : mock.approveMapListing(id);
export const rejectMapListing = (id: string, reason: string) => env.dataSource === 'api' ? api.rejectMapListing(id, reason) : mock.rejectMapListing(id, reason);
export const toggleMapListing = (id: string) => env.dataSource === 'api' ? api.toggleMapListing(id) : mock.toggleMapListing(id);
export const deleteMapListing = (id: string) => env.dataSource === 'api' ? api.deleteMapListing(id) : mock.deleteMapListing(id);
