import { useState } from 'react';
import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Button, ConfirmDialog, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { AdoptionStatusBadge } from '../components/adoption-badges';
import { AdoptionApplicationsSection, AdoptionMainDetails, AdoptionTimelineSection, PublisherPanel } from '../components/adoption-details-sections';
import { ApprovalDialog, RejectionDialog } from '../components/adoption-workflow-dialogs';
import { useAdoptionRequest, useDeleteAdoptionRequest } from '../hooks';
import { formatAdoptionDate } from '../utils';

function DetailsSkeleton() { return <div className="space-y-5"><Skeleton className="h-20 rounded-xl"/><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]"><div className="space-y-4"><Skeleton className="h-72 rounded-xl"/><Skeleton className="h-64 rounded-xl"/></div><Skeleton className="h-72 rounded-xl"/></div></div>; }

export function AdoptionRequestDetailsPage() {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const query = useAdoptionRequest(requestId);
  const deleteMutation = useDeleteAdoptionRequest(requestId);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (query.isLoading) return <DetailsSkeleton/>;
  if (query.isError) return <ErrorState title="تعذر تحميل عرض التبني" description={query.error.message} onRetry={() => void query.refetch()}/>;
  if (!query.data) return <ErrorState title="عرض التبني غير موجود" description="قد يكون العرض قد حُذف أو أن الرابط غير صحيح."/>;
  const details = query.data;
  const request = details.request;
  const actions = <div className="flex flex-wrap items-center gap-2">{request.status === 'PENDING_REVIEW' && <><PermissionGuard permission="adoption:approve"><Button className="h-9 rounded-xl" onClick={() => setApprovalOpen(true)}><CheckCircle2 className="size-4"/>الموافقة والنشر</Button></PermissionGuard><PermissionGuard permission="adoption:reject"><Button variant="secondary" className="h-9 rounded-xl text-critical" onClick={() => setRejectionOpen(true)}><XCircle className="size-4"/>رفض النشر</Button></PermissionGuard></>}<PermissionGuard permission="adoption:delete"><Button variant="ghost" className="h-9 rounded-xl text-critical hover:bg-critical/5 hover:text-critical" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4"/>حذف</Button></PermissionGuard></div>;
  return <div className="space-y-5"><PageHeader title={request.animal.name ?? 'عرض تبني'} description={`${request.id} · ${request.publisher.name} · آخر تحديث ${formatAdoptionDate(request.updatedAt)}`} breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'عروض التبني', href: '/adoption-requests' }, { label: request.id }]} actions={actions}/><div className="flex flex-wrap items-center gap-2"><AdoptionStatusBadge status={request.status}/>{request.publisher.type === 'ORGANIZATION' && <span className="text-[11px] text-muted-foreground">منشور بواسطة جمعية</span>}{request.applicationsCount > 0 && <span className="text-[11px] text-muted-foreground">· {request.applicationsCount.toLocaleString('ar-SA-u-nu-latn')} طلب تبنٍ</span>}</div><div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]"><main className="space-y-4"><AdoptionMainDetails details={details}/>{request.status === 'PUBLISHED' || request.status === 'ADOPTED' ? <AdoptionApplicationsSection details={details}/> : null}<AdoptionTimelineSection details={details}/></main><aside className="space-y-4 xl:sticky xl:top-24"><PublisherPanel details={details}/></aside></div><ApprovalDialog details={details} open={approvalOpen} onOpenChange={setApprovalOpen}/><RejectionDialog details={details} open={rejectionOpen} onOpenChange={setRejectionOpen}/><ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف عرض التبني" description="سيتم حذف العرض من لوحة الإدارة. استخدم الحذف للمحتوى الذي يجب إزالته نهائياً من المنصة." confirmLabel="حذف العرض" destructive onConfirm={() => deleteMutation.mutate('حذف إداري للعرض', { onSuccess: () => { toast.success('تم حذف عرض التبني'); navigate('/adoption-requests'); }, onError: () => toast.error('تعذر حذف العرض') })}/></div>;
}
