import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card } from '@/components/ui';
import { Home, RotateCcw, TriangleAlert } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; errorMessage?: string; }

export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State { return { hasError: true, errorMessage: error.message }; }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Production observability can be connected here without exposing stack traces in the UI.
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return <main dir="rtl" lang="ar" className="flex min-h-screen items-center justify-center bg-background p-6"><Card className="w-full max-w-xl text-center"><TriangleAlert className="mx-auto size-10 text-critical"/><h1 className="mt-4 text-xl font-bold">حدث خطأ غير متوقع</h1><p className="mt-2 text-sm leading-7 text-muted-foreground">تعذر عرض هذه الواجهة بأمان. لم يتم إظهار تفاصيل تقنية أو أثر الخطأ للمستخدم.</p>{import.meta.env.DEV && this.state.errorMessage ? <p dir="ltr" className="mt-3 rounded-md bg-muted p-3 text-start font-mono text-xs text-muted-foreground">{this.state.errorMessage}</p> : null}<div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="secondary" onClick={() => globalThis.location.reload()}><RotateCcw className="size-4"/>إعادة المحاولة</Button><Button onClick={() => globalThis.location.assign('/dashboard')}><Home className="size-4"/>العودة إلى الرئيسية</Button></div></Card></main>;
    }
    return this.props.children;
  }
}
