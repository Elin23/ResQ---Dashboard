import { env } from '@/config/env';
import type { AdminFilters, CreateRoleInput, InviteAdminInput, LookupType, SystemLookupItem, SystemSettings, UpdateRoleInput } from '../types';
import * as api from './settings.api';
import * as mock from './settings.mock';
type Actor={id:string;name:string;roleLabel:string};
export const getAdminUsers=(f:AdminFilters,s?:AbortSignal)=>env.dataSource==='api'?api.getAdminUsers(f,s):mock.getAdminUsers(f);
export const getAdminUser=(id:string,s?:AbortSignal)=>env.dataSource==='api'?api.getAdminUser(id,s):mock.getAdminUser(id);
export const getRoles=(s?:AbortSignal)=>env.dataSource==='api'?api.getRoles(s):mock.getRoles();
export const getRole=(id:string,s?:AbortSignal)=>env.dataSource==='api'?api.getRole(id,s):mock.getRole(id);
export const getSystemSettings=(s?:AbortSignal)=>env.dataSource==='api'?api.getSystemSettings(s):mock.getSystemSettings();
export const getPermissionDefinitions=(s?:AbortSignal)=>env.dataSource==='api'?api.getPermissionDefinitions(s):mock.getPermissionDefinitions();
export const getLookupValues=(t:LookupType,s?:AbortSignal)=>env.dataSource==='api'?api.getLookupValues(t,s):mock.getLookupValues(t);
export const inviteAdmin=(i:InviteAdminInput,a:Actor)=>env.dataSource==='api'?api.inviteAdmin(i):mock.inviteAdmin(i,a);
export const suspendAdmin=(id:string,r:string,a:Actor)=>env.dataSource==='api'?api.suspendAdmin(id,r):mock.suspendAdmin(id,r,a);
export const reactivateAdmin=(id:string,a:Actor)=>env.dataSource==='api'?api.reactivateAdmin(id):mock.reactivateAdmin(id,a);
export const updateAdminRoles=(id:string,i:{roleIds:string[]},a:Actor)=>env.dataSource==='api'?api.updateAdminRoles(id,i):mock.updateAdminRoles(id,i,a);
export const createRole=(i:CreateRoleInput,a:Actor)=>env.dataSource==='api'?api.createRole(i):mock.createRole(i,a);
export const updateRole=(id:string,i:UpdateRoleInput,a:Actor)=>env.dataSource==='api'?api.updateRole(id,i):mock.updateRole(id,i,a);
export const deleteRole=(id:string,a:Actor)=>env.dataSource==='api'?api.deleteRole(id):mock.deleteRole(id,a);
export const updateOperationalTargets=(i:SystemSettings['targets'],a:Actor)=>env.dataSource==='api'?api.updateOperationalTargets(i):mock.updateOperationalTargets(i,a);
export const updateMediaLimits=(i:SystemSettings['media'],a:Actor)=>env.dataSource==='api'?api.updateMediaLimits(i):mock.updateMediaLimits(i,a);
export const addEmergencyContact=(i:Omit<SystemSettings['emergencyContacts'][number],'id'>,a:Actor)=>env.dataSource==='api'?api.addEmergencyContact(i):mock.addEmergencyContact(i,a);
export const updateEmergencyContact=(i:SystemSettings['emergencyContacts'][number],a:Actor)=>env.dataSource==='api'?api.updateEmergencyContact(i):mock.updateEmergencyContact(i,a);
export const deleteEmergencyContact=(id:string,a:Actor)=>env.dataSource==='api'?api.deleteEmergencyContact(id):mock.deleteEmergencyContact(id,a);
export const updateBackupSettings=(i:SystemSettings['backup'],a:Actor)=>env.dataSource==='api'?api.updateBackupSettings(i):mock.updateBackupSettings(i,a);
export interface CreatedSystemBackup { fileName?: string; payload?: string; requested?: boolean; }
export async function createSystemBackup(a:Actor):Promise<CreatedSystemBackup | undefined>{
  if(env.dataSource==='api'){
    const raw=await api.createSystemBackup();
    return raw === undefined ? undefined : { requested: true };
  }
  const result=await mock.createSystemBackup(a);
  return {fileName:result.fileName,payload:result.payload};
}
export const updateLookup=(t:LookupType,i:SystemLookupItem,a:Actor)=>env.dataSource==='api'?api.updateLookup(t,i):mock.updateLookup(t,i,a);
export const addLookup=(t:LookupType,l:string,a:Actor)=>env.dataSource==='api'?api.addLookup(t,l):mock.addLookup(t,l,a);
