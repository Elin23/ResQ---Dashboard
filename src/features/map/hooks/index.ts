import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveMapListing, createMapListing, deleteMapListing, getOperationalMapData, rejectMapListing, toggleMapListing } from '../services/operational-map.service';
export const operationalMapKeys={all:['map-directory'] as const,data:()=>['map-directory','data'] as const};
export function useOperationalMapData(enabled=true){return useQuery({queryKey:operationalMapKeys.data(),queryFn:getOperationalMapData,enabled});}
function useRefresh(){const client=useQueryClient();return()=>client.invalidateQueries({queryKey:operationalMapKeys.all});}
export function useCreateMapListing(){const refresh=useRefresh();return useMutation({mutationFn:createMapListing,onSuccess:refresh});}
export function useApproveMapListing(){const refresh=useRefresh();return useMutation({mutationFn:approveMapListing,onSuccess:refresh});}
export function useRejectMapListing(){const refresh=useRefresh();return useMutation({mutationFn:({id,reason}:{id:string;reason:string})=>rejectMapListing(id,reason),onSuccess:refresh});}
export function useToggleMapListing(){const refresh=useRefresh();return useMutation({mutationFn:toggleMapListing,onSuccess:refresh});}
export function useDeleteMapListing(){const refresh=useRefresh();return useMutation({mutationFn:deleteMapListing,onSuccess:refresh});}
