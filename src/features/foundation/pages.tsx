import { Home, RotateCcw, ShieldX } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button, Card } from '@/components/ui';


export function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { permissionLabel?: string; from?: string } | null;
  return <div className="flex min-h-[calc(100vh-var(--layout-header))] items-center justify-center p-6"><Card className="w-full max-w-xl text-center"><p className="text-sm font-bold text-critical">403 · صفحة محمية</p><ShieldX className="mx-auto mt-3 size-11 text-critical" /><h1 className="mt-4 text-2xl font-black">هذه الصفحة ليست ضمن صلاحيات حسابك</h1><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">تم منع الوصول لأن الدور الإداري الحالي لا يملك الصلاحية المطلوبة. الصفحة محمية ولم يتم تحميل أو عرض بياناتها.</p>{state?.permissionLabel && <div className="mx-auto mt-4 max-w-md rounded-md border bg-muted p-3 text-sm"><span className="text-muted-foreground">الصلاحية المطلوبة:</span> <strong>{state.permissionLabel}</strong></div>}<div className="mt-6 flex flex-wrap justify-center gap-2"><Button variant="secondary" onClick={() => navigate(-1)}><RotateCcw className="size-4"/>الرجوع للصفحة السابقة</Button><Link to="/dashboard"><Button><Home className="size-4"/>العودة إلى الرئيسية</Button></Link></div></Card></div>;
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><Card className="w-full max-w-lg text-center"><p className="text-5xl font-bold text-primary">404</p><h1 className="mt-3 text-xl font-bold">الصفحة غير موجودة</h1><p className="mt-2 text-sm leading-7 text-muted-foreground">يبدو أن الرابط الذي تحاول فتحه غير صالح أو تم نقله.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="secondary" onClick={() => navigate(-1)}>الرجوع</Button><Link to="/dashboard"><Button><Home className="size-4"/>العودة إلى الرئيسية</Button></Link></div></Card></div>;
}
