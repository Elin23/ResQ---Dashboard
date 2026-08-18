import{useMemo,useState}from'react';import type{ColumnDef}from'@tanstack/react-table';import{zodResolver}from'@hookform/resolvers/zod';import{useForm}from'react-hook-form';import{toast}from'sonner';import{AlertTriangle,ChevronDown,ChevronUp,DatabaseBackup,ExternalLink,MoreHorizontal,Pencil,ShieldCheck,Trash2,UserPlus}from'lucide-react';import{Avatar,Badge,Button,Card,Checkbox,ConfirmDialog,DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,IconButton,Input,Modal,SectionHeader,Select,Switch,Textarea}from'@/components/ui';import{DataTable}from'@/components/ui/data-table';import{permissionDefinitions,permissionModuleLabels,type Permission,type PermissionModule}from'@/features/auth/permissions';import{usePermission}from'@/features/auth/rbac';import{useBlocker,useNavigate}from'react-router';import{adminStatusLabels,lookupLabels}from'../constants';import{inviteAdminSchema,roleSchema,suspendAdminSchema,targetsSchema}from'../schemas';import type{AdminFilters,AdminRoleRecord,AdminUser,BackupFrequency,CreateRoleInput,EmergencyContact,EmergencyContactCategory,InviteAdminInput,LookupType,SystemLookupItem,SystemSettings}from'../types';import{formatAdminDate}from'../utils';import{useAddEmergencyContact,useAddLookup,useCreateRole,useCreateSystemBackup,useDeleteEmergencyContact,useInviteAdmin,useReactivateAdmin,useRoles,useSuspendAdmin,useUpdateAdminRoles,useUpdateBackupSettings,useUpdateEmergencyContact,useUpdateLookup,useUpdateMediaLimits,useUpdateRole,useUpdateTargets}from'../hooks';
export function AdminStatusBadge({status}:{status:AdminUser['status']}){return <Badge tone={status==='ACTIVE'?'success':status==='INVITED'?'info':status==='SUSPENDED'?'pending':'critical'}>{adminStatusLabels[status]}</Badge>}
export function AdminUsersTable({items,total,pageCount,filters,loading,onPage}:{items:AdminUser[];total:number;pageCount:number;filters:AdminFilters;loading:boolean;onPage:(page:number,pageSize:number)=>void}){const nav=useNavigate();const columns=useMemo<Array<ColumnDef<AdminUser,unknown>>>(()=>[{id:'admin',header:'المسؤول',cell:({row})=><div className="flex items-center gap-3"><Avatar name={row.original.fullName} src={row.original.avatarUrl}/><div><p className="font-semibold">{row.original.fullName}</p><p className="text-xs text-muted-foreground" dir="ltr">{row.original.id}</p></div></div>},{id:'email',header:'البريد الإلكتروني',cell:({row})=><span dir="ltr">{row.original.email}</span>},{id:'roles',header:'الأدوار',cell:({row})=><div className="flex flex-wrap gap-1">{row.original.roles.map(r=><Badge key={r.id}>{r.name}</Badge>)}</div>},{id:'status',header:'الحالة',cell:({row})=><AdminStatusBadge status={row.original.status}/>},{id:'lastLogin',header:'آخر تسجيل دخول',cell:({row})=>formatAdminDate(row.original.lastLoginAt)},{id:'createdAt',header:'تاريخ الإنشاء',cell:({row})=>formatAdminDate(row.original.createdAt)}],[]);return <DataTable data={items} columns={columns} getRowId={a=>a.id} enableSearch={false} manualPagination pageCount={pageCount} totalCount={total} loading={loading} state={{pageIndex:filters.page-1,pageSize:filters.pageSize,search:filters.search,sorting:[]}} onStateChange={s=>onPage(s.pageIndex+1,s.pageSize)} onRowClick={a=>nav(`/settings/admin-users/${a.id}`)} rowAriaLabel={a=>`فتح حساب المسؤول ${a.fullName}`} rowActions={a=><DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${a.fullName}`}><MoreHorizontal className="size-4"/></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>nav(`/settings/admin-users/${a.id}`)}><ExternalLink className="size-4"/>عرض الحساب</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}/>}
export function InviteAdminDialog({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}){const roles=useRoles(),mutation=useInviteAdmin();const{register,handleSubmit,setValue,watch,formState:{errors},reset}=useForm<InviteAdminInput>({resolver:zodResolver(inviteAdminSchema),defaultValues:{fullName:'',email:'',roleIds:[]}});const selected=watch('roleIds');const submit=handleSubmit(async v=>{try{await mutation.mutateAsync(v);toast.success('تم إنشاء دعوة المسؤول في البيانات التجريبية.');reset();onOpenChange(false)}catch(e){toast.error(e instanceof Error?e.message:'تعذر إنشاء الدعوة.')}});return <Modal open={open} onOpenChange={onOpenChange} title="دعوة مسؤول جديد" description="سيتم إنشاء حالة دعوة فقط. إرسال البريد وقبول الدعوة مسؤولية الخادم." footer={<><Button variant="secondary" onClick={()=>onOpenChange(false)}>إلغاء</Button><Button onClick={()=>void submit()} disabled={mutation.isPending}><UserPlus className="size-4"/>إنشاء الدعوة</Button></>}><form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit()}}><label className="block text-sm font-semibold">الاسم<Input className="mt-1" {...register('fullName')}/>{errors.fullName&&<span className="text-xs text-critical">{errors.fullName.message}</span>}</label><label className="block text-sm font-semibold">البريد الإلكتروني<Input dir="ltr" className="mt-1" {...register('email')}/>{errors.email&&<span className="text-xs text-critical">{errors.email.message}</span>}</label><fieldset className="space-y-2"><legend className="text-sm font-semibold">الأدوار</legend>{roles.data?.map(r=><Checkbox key={r.id} label={r.name} checked={selected.includes(r.id)} onCheckedChange={checked=>setValue('roleIds',checked?[...selected,r.id]:selected.filter(id=>id!==r.id),{shouldValidate:true})}/>) }{errors.roleIds&&<p className="text-xs text-critical">{errors.roleIds.message}</p>}</fieldset></form></Modal>}
export function AdminStatusActions({admin,currentAdminId}:{admin:AdminUser;currentAdminId:string}){const canSuspend=usePermission('admins.suspend'),canActivate=usePermission('admins.activate');const suspend=useSuspendAdmin(),reactivate=useReactivateAdmin();const[open,setOpen]=useState(false);const{register,handleSubmit,reset,formState:{errors}}=useForm<{reason:string}>({resolver:zodResolver(suspendAdminSchema),defaultValues:{reason:''}});const self=admin.id===currentAdminId;return <>{admin.status==='ACTIVE'&&canSuspend&&<Button variant="danger" disabled={self} onClick={()=>setOpen(true)}>تعليق الحساب</Button>}{admin.status==='SUSPENDED'&&canActivate&&<Button onClick={async()=>{try{await reactivate.mutateAsync(admin.id);toast.success('تمت إعادة تفعيل المسؤول.')}catch(e){toast.error(e instanceof Error?e.message:'تعذر التفعيل.')}}}>إعادة التفعيل</Button>}{self&&<p className="text-xs text-muted-foreground">لا يمكنك تعليق حسابك الإداري الحالي.</p>}<Modal open={open} onOpenChange={setOpen} title="تعليق حساب المسؤول" description="سيُمنع المسؤول من الوصول إلى لوحة الإدارة حتى إعادة تفعيله." footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>إلغاء</Button><Button variant="danger" onClick={()=>void handleSubmit(async v=>{try{await suspend.mutateAsync({id:admin.id,reason:v.reason});toast.success('تم تعليق الحساب.');reset();setOpen(false)}catch(e){toast.error(e instanceof Error?e.message:'تعذر التعليق.')}})()}>تأكيد التعليق</Button></>}><label className="block text-sm font-semibold">سبب التعليق<Textarea className="mt-1" {...register('reason')}/>{errors.reason&&<span className="text-xs text-critical">{errors.reason.message}</span>}</label></Modal></>}
export function AdminRolesEditor({admin}:{admin:AdminUser}){const roles=useRoles(),mutation=useUpdateAdminRoles();const[selected,setSelected]=useState(admin.roles.map(r=>r.id));const roleRows=roles.data??[];const currentPermissions=new Set(roleRows.filter(r=>admin.roles.some(a=>a.id===r.id)).flatMap(r=>r.permissions));const nextPermissions=new Set(roleRows.filter(r=>selected.includes(r.id)).flatMap(r=>r.permissions));const added=[...nextPermissions].filter(p=>!currentPermissions.has(p));return <Card><SectionHeader title="الأدوار الممنوحة" description="الصلاحيات الفعلية هي اتحاد صلاحيات جميع الأدوار."/><div className="mt-4 space-y-2">{roles.data?.map(r=><Checkbox key={r.id} checked={selected.includes(r.id)} label={`${r.name}${r.system?' · دور نظام':''}`} onCheckedChange={checked=>setSelected(checked?[...selected,r.id]:selected.filter(id=>id!==r.id))}/>)}</div>{added.length>0&&<div className="mt-4 rounded-md bg-info/10 p-3 text-sm">إضافة الأدوار المحددة ستمنح {added.length} صلاحيات جديدة لهذا المسؤول.</div>}<Button className="mt-4" disabled={!selected.length||mutation.isPending} onClick={async()=>{try{await mutation.mutateAsync({id:admin.id,roleIds:selected});toast.success('تم تحديث أدوار المسؤول.')}catch(e){toast.error(e instanceof Error?e.message:'تعذر تحديث الأدوار.')}}}>حفظ الأدوار</Button></Card>}
export function PermissionMatrix({value,onChange,readOnly=false}:{value:Permission[];onChange?:(v:Permission[])=>void;readOnly?:boolean}){const groups=useMemo(()=>{const map=new Map<PermissionModule,typeof permissionDefinitions>();permissionDefinitions.forEach(p=>map.set(p.module,[...(map.get(p.module)??[]),p]));return[...map.entries()]},[]);const[toggles,setToggles]=useState<Set<PermissionModule>>(new Set(groups.map(([m])=>m)));return <div className="space-y-3">{groups.map(([module,defs])=><Card key={module} className="p-0 overflow-hidden"><button type="button" className="flex w-full items-center justify-between px-4 py-3 text-start" onClick={()=>setToggles(cur=>{const n=new Set(cur);n.has(module)?n.delete(module):n.add(module);return n})}><span className="font-bold">{permissionModuleLabels[module]}</span>{toggles.has(module)?<ChevronUp className="size-4"/>:<ChevronDown className="size-4"/>}</button>{toggles.has(module)&&<div className="border-t p-4 grid gap-3 md:grid-cols-2">{defs.map(d=><label key={d.key} className="flex items-start gap-3 rounded-md border p-3"><Checkbox checked={value.includes(d.key)} ariaLabel={d.label} onCheckedChange={checked=>!readOnly&&onChange?.(checked?[...value,d.key]:value.filter(p=>p!==d.key))}/><span><span className="flex flex-wrap items-center gap-2 font-semibold">{d.label}{d.sensitive&&<Badge tone="critical">صلاحية حساسة</Badge>}</span><span className="mt-1 block text-xs text-muted-foreground">{d.description}</span></span></label>)}</div>}</Card>)}</div>}
export function CreateRoleDialog({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}){const mutation=useCreateRole();const{register,handleSubmit,setValue,watch,reset,formState:{errors}}=useForm<CreateRoleInput>({resolver:zodResolver(roleSchema),defaultValues:{name:'',description:'',permissions:[]}});const perms=watch('permissions');const sensitive=permissionDefinitions.filter(p=>p.sensitive&&perms.includes(p.key));const submit=handleSubmit(async input=>{try{await mutation.mutateAsync(input);toast.success('تم إنشاء الدور.');reset();onOpenChange(false)}catch(e){toast.error(e instanceof Error?e.message:'تعذر إنشاء الدور.')}});return <Modal open={open} onOpenChange={onOpenChange} title="إنشاء دور إداري" description="أنشئ دورًا مخصصًا قائمًا على الصلاحيات، دون استثناءات خاصة لكل مسؤول." footer={<><Button variant="secondary" onClick={()=>onOpenChange(false)}>إلغاء</Button><Button disabled={mutation.isPending} onClick={()=>void submit()}>إنشاء الدور</Button></>}><form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit()}}><label className="block text-sm font-semibold">اسم الدور<Input className="mt-1" {...register('name')}/>{errors.name&&<span className="text-xs text-critical">{errors.name.message}</span>}</label><label className="block text-sm font-semibold">الوصف<Textarea className="mt-1" {...register('description')}/>{errors.description&&<span className="text-xs text-critical">{errors.description.message}</span>}</label>{sensitive.length>0&&<div className="rounded-md border border-critical/20 bg-critical/5 p-3 text-sm"><p className="font-semibold">سيُمنح الدور {sensitive.length} صلاحيات حساسة.</p><p className="mt-1 text-muted-foreground">راجعها بعناية قبل الحفظ.</p></div>}<PermissionMatrix value={perms} onChange={value=>setValue('permissions',value,{shouldValidate:true,shouldDirty:true})}/>{errors.permissions&&<p className="text-sm text-critical">{errors.permissions.message}</p>}</form></Modal>}
export function RoleEditor({role}:{role:AdminRoleRecord}){const canUpdate=usePermission('roles.update');const mutation=useUpdateRole();const[name,setName]=useState(role.name),[description,setDescription]=useState(role.description??''),[perms,setPerms]=useState<Permission[]>(role.permissions),[confirm,setConfirm]=useState(false);const addedSensitive=permissionDefinitions.filter(p=>p.sensitive&&perms.includes(p.key)&&!role.permissions.includes(p.key));const readOnly=!canUpdate||role.systemRole==='SUPER_ADMIN';const save=async()=>{try{await mutation.mutateAsync({id:role.id,input:{name,description,permissions:perms}});toast.success('تم تحديث الدور وتسجيل التغيير في سجل النشاط.');setConfirm(false)}catch(e){toast.error(e instanceof Error?e.message:'تعذر تحديث الدور.')}};return <div className="space-y-4"><Card><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">اسم الدور<Input className="mt-1" value={name} disabled={role.system||readOnly} onChange={e=>setName(e.target.value)}/></label><label className="text-sm font-semibold">الوصف<Input className="mt-1" value={description} disabled={readOnly} onChange={e=>setDescription(e.target.value)}/></label></div>{role.usersCount>0&&<p className="mt-3 text-sm text-muted-foreground">هذا الدور مستخدم من قبل {role.usersCount} مسؤولين، وستنعكس التغييرات عليهم جميعًا.</p>}{addedSensitive.length>0&&<div className="mt-3 rounded-md border border-pending/30 bg-pending/10 p-3 text-sm"><AlertTriangle className="mb-1 size-4"/>ستضيف {addedSensitive.length} صلاحيات حساسة جديدة: {addedSensitive.map(p=>p.label).join('، ')}.</div>}{role.systemRole==='SUPER_ADMIN'&&<p className="mt-3 text-sm text-muted-foreground">صلاحيات مدير النظام الشامل مقفلة في المحاكاة لحماية آخر مسار استرداد إداري.</p>}</Card><PermissionMatrix value={perms} onChange={setPerms} readOnly={readOnly}/>{!readOnly&&<Button disabled={mutation.isPending} onClick={()=>addedSensitive.length?setConfirm(true):void save()}><ShieldCheck className="size-4"/>حفظ صلاحيات الدور</Button>}<ConfirmDialog open={confirm} onOpenChange={setConfirm} title="تأكيد منح صلاحيات حساسة" description={`سيتم منح هذا الدور ${addedSensitive.length} صلاحيات حساسة جديدة، وستنطبق على ${role.usersCount} مسؤولين يستخدمون الدور.`} confirmLabel="تأكيد وحفظ" onConfirm={save}/></div>}
export function TargetsForm({settings}:{settings:SystemSettings}){const mutation=useUpdateTargets();const[pending,setPending]=useState<SystemSettings['targets']|null>(null);const{register,handleSubmit,formState:{errors,isDirty},reset}=useForm<SystemSettings['targets']>({resolver:zodResolver(targetsSchema),defaultValues:settings.targets});const blocker=useBlocker(isDirty);const save=async()=>{if(!pending)return;try{await mutation.mutateAsync(pending);toast.success('تم حفظ أهداف التشغيل.');reset(pending);setPending(null)}catch(e){toast.error(e instanceof Error?e.message:'تعذر حفظ الإعدادات.')}};return <Card><SectionHeader title="أهداف التشغيل الداخلية" description="هذه أهداف تشغيلية داخلية وليست اتفاقيات SLA تعاقدية."/><form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(v=>setPending(v))}>{([['reportReviewMinutes','وقت مراجعة البلاغ المستهدف'],['missionAcceptanceMinutes','وقت قبول المهمة المستهدف'],['missionArrivalMinutes','وقت الوصول المستهدف'],['supportFirstResponseMinutes','وقت أول استجابة للدعم']]as const).map(([key,label])=><label key={key} className="text-sm font-semibold">{label}<div className="mt-1 flex items-center gap-2"><Input type="number" {...register(key,{valueAsNumber:true})}/><span className="text-sm text-muted-foreground">دقيقة</span></div>{errors[key]&&<span className="text-xs text-critical">قيمة بين 1 و1440 مطلوبة.</span>}</label>)}<label className="text-sm font-semibold">هدف مراجعة التبني<Input type="number" className="mt-1" {...register('adoptionReviewHours',{valueAsNumber:true})}/><span className="text-xs text-muted-foreground">بالساعات</span></label><div className="md:col-span-2 flex gap-2"><Button type="submit" disabled={!isDirty||mutation.isPending}>مراجعة التغييرات</Button><Button variant="secondary" disabled={!isDirty} onClick={()=>reset(settings.targets)}>إلغاء</Button></div></form><ConfirmDialog open={Boolean(pending)} onOpenChange={open=>!open&&setPending(null)} title="مراجعة تغيير أهداف التشغيل" description="سيتم تحديث أهداف تشغيلية تستخدمها التحليلات ومؤشرات التجاوز. راجع القيم قبل التطبيق." confirmLabel="حفظ التغييرات" onConfirm={save}/><ConfirmDialog open={blocker.state==='blocked'} onOpenChange={open=>{if(!open&&blocker.state==='blocked')blocker.reset()}} title="مغادرة الإعدادات؟" description="لديك تغييرات غير محفوظة في أهداف التشغيل." confirmLabel="مغادرة دون حفظ" destructive onConfirm={()=>{if(blocker.state==='blocked')blocker.proceed()}}/></Card>}
function LookupRow({type,item,index,count,readOnly}:{type:LookupType;item:SystemLookupItem;index:number;count:number;readOnly:boolean}){const update=useUpdateLookup();const[draft,setDraft]=useState(item.label);const save=async(next:SystemLookupItem)=>{try{await update.mutateAsync({type,item:next});toast.success('تم تحديث القيمة المرجعية.')}catch(e){toast.error(e instanceof Error?e.message:'تعذر تحديث القيمة.')}};return <div className="flex flex-wrap items-center gap-2 rounded-md border p-3"><Input className="min-w-52 flex-1" value={draft} disabled={readOnly} onChange={e=>setDraft(e.target.value)} aria-label={`تسمية ${item.key}`}/>{!readOnly&&<Button size="sm" variant="secondary" disabled={draft.trim().length<2||draft===item.label} onClick={()=>void save({...item,label:draft.trim()})}>حفظ الاسم</Button>}<Switch checked={item.active} onCheckedChange={checked=>!readOnly&&void save({...item,active:checked})} label={item.active?'فعال':'غير فعال'}/>{!readOnly&&<><Button size="sm" variant="secondary" disabled={index===0} onClick={()=>void save({...item,order:item.order-1})}>أعلى</Button><Button size="sm" variant="secondary" disabled={index===count-1} onClick={()=>void save({...item,order:item.order+1})}>أسفل</Button></>}{item.locked&&<Badge>مفتاح ثابت</Badge>}</div>}
export function LookupManager({type,items,readOnly=false}:{type:LookupType;items:SystemLookupItem[];readOnly?:boolean}){const add=useAddLookup();const[label,setLabel]=useState('');const sorted=[...items].sort((a,b)=>a.order-b.order);return <Card><SectionHeader title={lookupLabels[type]} description="القيم ذات المفاتيح الثابتة يمكن تعديل عرضها/تفعيلها دون تغيير مفتاح الحالة البرمجي."/><div className="mt-4 space-y-2">{sorted.map((item,index)=><LookupRow key={item.id} type={type} item={item} index={index} count={sorted.length} readOnly={readOnly}/>)}</div>{!readOnly&&!items.some(i=>i.locked)&&<div className="mt-4 flex gap-2"><Input value={label} onChange={e=>setLabel(e.target.value)} placeholder="قيمة جديدة"/><Button disabled={label.trim().length<2} onClick={async()=>{try{await add.mutateAsync({type,label:label.trim()});setLabel('');toast.success('تمت إضافة القيمة المرجعية.')}catch(e){toast.error(e instanceof Error?e.message:'تعذر إضافة القيمة.')}}}>إضافة</Button></div>}</Card>}

export function MediaLimitsForm({settings,readOnly=false}:{settings:SystemSettings;readOnly?:boolean}){const mutation=useUpdateMediaLimits();const[value,setValue]=useState(settings.media),[confirm,setConfirm]=useState(false);const valid=value.maxImages>=1&&value.maxImages<=20&&value.maxImageMb>=1&&value.maxImageMb<=25&&value.maxVideoMb>=1&&value.maxVideoMb<=200;const save=async()=>{try{await mutation.mutateAsync(value);toast.success('تم تحديث حدود الوسائط.');setConfirm(false)}catch(e){toast.error(e instanceof Error?e.message:'تعذر تحديث حدود الوسائط.')}};return <Card><SectionHeader title="حدود الوسائط" description="خيارات مقيدة للواجهة؛ يجب على الخادم فرض الحجم والنوع فعليًا."/><div className="mt-4 grid gap-4 md:grid-cols-3"><label className="text-sm font-semibold">الحد الأقصى للصور<Input type="number" min={1} max={20} disabled={readOnly} className="mt-1" value={value.maxImages} onChange={e=>setValue({...value,maxImages:Number(e.target.value)})}/></label><label className="text-sm font-semibold">حجم الصورة MB<Input type="number" min={1} max={25} disabled={readOnly} className="mt-1" value={value.maxImageMb} onChange={e=>setValue({...value,maxImageMb:Number(e.target.value)})}/></label><label className="text-sm font-semibold">حجم الفيديو MB<Input type="number" min={1} max={200} disabled={readOnly} className="mt-1" value={value.maxVideoMb} onChange={e=>setValue({...value,maxVideoMb:Number(e.target.value)})}/></label></div><div className="mt-3 flex flex-wrap gap-2">{value.allowedTypes.map(type=><Badge key={type}>{type}</Badge>)}</div>{!readOnly&&<Button className="mt-4" disabled={!valid||mutation.isPending} onClick={()=>setConfirm(true)}>مراجعة وحفظ</Button>}<ConfirmDialog open={confirm} onOpenChange={setConfirm} title="تأكيد حدود الوسائط" description="سيتم تحديث حدود الرفع المعروضة للتطبيق. يجب أن يطبق الخادم الحدود نفسها لمنع التجاوز." confirmLabel="حفظ الحدود" onConfirm={save}/></Card>}
const emergencyCategoryOptions = [
  { value: 'VETERINARY', label: 'طوارئ بيطرية' },
  { value: 'RESCUE', label: 'طوارئ حيوانات' },
  { value: 'OTHER', label: 'جهة أخرى' },
] satisfies Array<{ value: EmergencyContactCategory; label: string }>;

const emergencyCategoryLabels: Record<EmergencyContactCategory, string> = {
  VETERINARY: 'طوارئ بيطرية',
  RESCUE: 'طوارئ حيوانات',
  OTHER: 'جهة أخرى',
};

export function EmergencyContactsManager({ settings, readOnly = false }: { settings: SystemSettings; readOnly?: boolean }) {
  const update = useUpdateEmergencyContact();
  const add = useAddEmergencyContact();
  const remove = useDeleteEmergencyContact();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [category, setCategory] = useState<EmergencyContactCategory>('VETERINARY');
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [deleting, setDeleting] = useState<EmergencyContact | null>(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await update.mutateAsync(editing);
      toast.success('تم تحديث جهة اتصال الطوارئ.');
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تحديث جهة الاتصال.');
    }
  };

  return <Card className="rounded-xl border-border/45 bg-white shadow-none">
    <SectionHeader title="جهات اتصال الطوارئ" description="أرقام موثوقة يمكن إظهارها داخل التطبيق للحالات العاجلة. يمكنك إضافة الجهة وتعديلها أو إيقاف ظهورها دون حذفها." />

    <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
      {settings.emergencyContacts.map(contact => <div key={contact.id} className="rounded-lg border border-border/45 px-3.5 py-3 transition-colors hover:bg-muted/25">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-medium text-foreground">{contact.name}</p>
              <Badge tone={contact.active ? 'success' : 'neutral'}>{contact.active ? 'ظاهر في التطبيق' : 'متوقف'}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{emergencyCategoryLabels[contact.category]}{contact.governorate ? ` · ${contact.governorate}` : ''}</p>
            <p dir="ltr" className="mt-1 text-start text-[12px] font-medium text-foreground">{contact.phone}</p>
          </div>

          {!readOnly && <div className="flex shrink-0 items-center gap-1">
            <IconButton label={`تعديل ${contact.name}`} onClick={() => setEditing(contact)}><Pencil className="size-4" /></IconButton>
            <IconButton label={`حذف ${contact.name}`} onClick={() => setDeleting(contact)}><Trash2 className="size-4 text-critical" /></IconButton>
          </div>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/35 pt-2.5">
          <span className="text-[11px] text-muted-foreground">حالة الظهور</span>
          <Switch checked={contact.active} onCheckedChange={checked => !readOnly && void update.mutateAsync({ ...contact, active: checked }).catch(() => toast.error('تعذر تحديث حالة جهة الاتصال.'))} label={contact.active ? 'فعال' : 'غير فعال'} />
        </div>
      </div>)}
    </div>

    {!readOnly && <div className="mt-5 border-t border-border/40 pt-4">
      <p className="text-[13px] font-semibold">إضافة جهة اتصال</p>
      <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
        <Input placeholder="اسم الجهة" value={name} onChange={event => setName(event.target.value)} />
        <Input dir="ltr" placeholder="رقم الهاتف" value={phone} onChange={event => setPhone(event.target.value)} />
        <Select value={category} onValueChange={value => setCategory(value as EmergencyContactCategory)} options={emergencyCategoryOptions} />
        <Input placeholder="المحافظة (اختياري)" value={governorate} onChange={event => setGovernorate(event.target.value)} />
        <Button className="h-9 rounded-xl" disabled={add.isPending || name.trim().length < 3 || phone.trim().length < 6} onClick={async () => {
          try {
            await add.mutateAsync({ name: name.trim(), phone: phone.trim(), category, governorate: governorate.trim() || undefined, active: true });
            setName('');
            setPhone('');
            setGovernorate('');
            setCategory('VETERINARY');
            toast.success('تمت إضافة جهة اتصال الطوارئ.');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'تعذر إضافة جهة الاتصال.');
          }
        }}>إضافة</Button>
      </div>
    </div>}

    <Modal open={Boolean(editing)} onOpenChange={open => !open && setEditing(null)} title="تعديل جهة اتصال الطوارئ" description="حدّث المعلومات التي ستظهر داخل التطبيق." footer={<><Button variant="secondary" onClick={() => setEditing(null)}>إلغاء</Button><Button disabled={!editing || update.isPending || editing.name.trim().length < 3 || editing.phone.trim().length < 6} onClick={() => void saveEdit()}>حفظ</Button></>}>
      {editing && <div className="space-y-3">
        <label className="block text-[12px] font-medium">اسم الجهة<Input className="mt-1" value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} /></label>
        <label className="block text-[12px] font-medium">رقم الهاتف<Input dir="ltr" className="mt-1" value={editing.phone} onChange={event => setEditing({ ...editing, phone: event.target.value })} /></label>
        <label className="block text-[12px] font-medium">نوع الجهة<div className="mt-1"><Select value={editing.category} onValueChange={value => setEditing({ ...editing, category: value as EmergencyContactCategory })} options={emergencyCategoryOptions} /></div></label>
        <label className="block text-[12px] font-medium">المحافظة<Input className="mt-1" value={editing.governorate ?? ''} onChange={event => setEditing({ ...editing, governorate: event.target.value || undefined })} /></label>
      </div>}
    </Modal>

    <ConfirmDialog open={Boolean(deleting)} onOpenChange={open => !open && setDeleting(null)} title="حذف جهة الاتصال؟" description={deleting ? `سيتم حذف ${deleting.name} من قائمة جهات الطوارئ.` : ''} confirmLabel="حذف" destructive onConfirm={async () => {
      if (!deleting) return;
      try {
        await remove.mutateAsync(deleting.id);
        toast.success('تم حذف جهة الاتصال.');
        setDeleting(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'تعذر حذف جهة الاتصال.');
      }
    }} />
  </Card>;
}

const backupFrequencyOptions = [
  { value: 'DAILY', label: 'يوميًا' },
  { value: 'WEEKLY', label: 'أسبوعيًا' },
  { value: 'MONTHLY', label: 'شهريًا' },
] satisfies Array<{ value: BackupFrequency; label: string }>;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBackup(fileName: string, payload: string) {
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function BackupSettingsManager({ settings, readOnly = false }: { settings: SystemSettings; readOnly?: boolean }) {
  const update = useUpdateBackupSettings();
  const create = useCreateSystemBackup();
  const [draft, setDraft] = useState(settings.backup);

  const changed = draft.automaticEnabled !== settings.backup.automaticEnabled || draft.frequency !== settings.backup.frequency || draft.retentionCount !== settings.backup.retentionCount || draft.includeAuditLog !== settings.backup.includeAuditLog;

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      toast.success('تم حفظ إعدادات النسخ الاحتياطي.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر حفظ إعدادات النسخ الاحتياطي.');
    }
  };

  const createNow = async () => {
    try {
      const backup = await create.mutateAsync();
      downloadBackup(backup.fileName, backup.payload);
      toast.success('تم إنشاء النسخة الاحتياطية وتنزيلها.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر إنشاء النسخة الاحتياطية.');
    }
  };

  return <div className="space-y-6">
    <Card className="rounded-xl border-border/45 bg-white shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="النسخ الاحتياطي" description="إدارة الجدولة والاحتفاظ بالنسخ، مع إمكانية إنشاء نسخة يدوية وتنزيلها فورًا." />
        {!readOnly && <Button className="h-9 shrink-0 rounded-xl" disabled={create.isPending} onClick={() => void createNow()}><DatabaseBackup className="size-4" />{create.isPending ? 'جارٍ الإنشاء…' : 'إنشاء نسخة الآن'}</Button>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border/45 p-3.5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[13px] font-medium">النسخ التلقائي</p><p className="mt-1 text-[11px] text-muted-foreground">إنشاء نسخة دورية حسب الجدول المحدد.</p></div>
            <Switch checked={draft.automaticEnabled} onCheckedChange={checked => !readOnly && setDraft({ ...draft, automaticEnabled: checked })} label={draft.automaticEnabled ? 'مفعل' : 'متوقف'} />
          </div>

          <label className="block text-[12px] font-medium text-foreground">تكرار النسخة<div className="mt-1"><Select value={draft.frequency} onValueChange={value => !readOnly && setDraft({ ...draft, frequency: value as BackupFrequency })} options={backupFrequencyOptions} /></div></label>
          <label className="block text-[12px] font-medium text-foreground">عدد النسخ المحتفظ بها<Input className="mt-1" type="number" min={1} max={90} disabled={readOnly} value={draft.retentionCount} onChange={event => setDraft({ ...draft, retentionCount: Math.min(90, Math.max(1, Number(event.target.value) || 1)) })} /></label>
          <div className="flex items-center justify-between gap-4"><div><p className="text-[12px] font-medium">تضمين سجل النشاط</p><p className="mt-1 text-[11px] text-muted-foreground">احتفظ بسجل التغييرات الإدارية ضمن النسخة.</p></div><Switch checked={draft.includeAuditLog} onCheckedChange={checked => !readOnly && setDraft({ ...draft, includeAuditLog: checked })} label={draft.includeAuditLog ? 'مضمن' : 'غير مضمن'} /></div>

          {!readOnly && <div className="flex gap-2 pt-1"><Button className="h-9 rounded-xl" disabled={!changed || update.isPending} onClick={() => void save()}>حفظ الإعدادات</Button><Button className="h-9 rounded-xl" variant="secondary" disabled={!changed} onClick={() => setDraft(settings.backup)}>إلغاء</Button></div>}
        </div>

        <div className="rounded-lg border border-border/45 p-3.5">
          <p className="text-[13px] font-medium">آخر نسخة</p>
          {settings.backup.lastBackupAt ? <dl className="mt-3 space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">تاريخ الإنشاء</dt><dd className="font-medium">{formatAdminDate(settings.backup.lastBackupAt)}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">أنشأها</dt><dd className="font-medium">{settings.backup.lastBackupBy?.name ?? 'النظام'}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">الجدولة</dt><dd className="font-medium">{settings.backup.automaticEnabled ? backupFrequencyOptions.find(option => option.value === settings.backup.frequency)?.label : 'متوقفة'}</dd></div>
          </dl> : <p className="mt-3 text-[12px] text-muted-foreground">لم يتم إنشاء نسخة احتياطية بعد.</p>}
          <div className="mt-4 rounded-lg bg-muted/35 px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">النسخة الحالية تجريبية داخل بيئة الـMock. عند ربط الـBackend يجب إنشاء النسخة الكاملة على الخادم وقاعدة البيانات وحمايتها وفق سياسة النسخ المعتمدة.</div>
        </div>
      </div>
    </Card>

    <Card className="rounded-xl border-border/45 bg-white shadow-none">
      <SectionHeader title="سجل النسخ" description="آخر النسخ التي تم إنشاؤها وفق سياسة الاحتفاظ الحالية." />
      <div className="mt-4 overflow-hidden rounded-lg border border-border/45">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-muted/30 px-3 py-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-[1.2fr_1fr_auto_auto]">
          <span>النسخة</span><span className="hidden sm:block">بواسطة</span><span>النوع</span><span>الحجم</span>
        </div>
        {settings.backupHistory.length ? settings.backupHistory.map(record => <div key={record.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border/35 px-3 py-2.5 text-[12px] sm:grid-cols-[1.2fr_1fr_auto_auto]">
          <div className="min-w-0"><p className="truncate font-medium">{record.fileName}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{formatAdminDate(record.createdAt)}</p></div>
          <span className="hidden text-muted-foreground sm:block">{record.createdBy.name}</span>
          <Badge tone={record.kind === 'MANUAL' ? 'info' : 'neutral'}>{record.kind === 'MANUAL' ? 'يدوية' : 'تلقائية'}</Badge>
          <span dir="ltr" className="text-muted-foreground">{formatBytes(record.sizeBytes)}</span>
        </div>) : <p className="p-4 text-[12px] text-muted-foreground">لا يوجد سجل نسخ بعد.</p>}
      </div>
    </Card>
  </div>;
}
