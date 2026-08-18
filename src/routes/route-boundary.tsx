import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Card } from '@/components/ui';
import { RotateCcw, TriangleAlert } from 'lucide-react';

interface BoundaryProps {
  children: ReactNode;
  resetKey: string;
  onRetry: () => void;
}

interface BoundaryState {
  error: Error | null;
}

class RouteBoundaryImpl extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[route-render-error]', error, info.componentStack);
    }
  }

  override componentDidUpdate(previousProps: BoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <Card className="mx-auto flex min-h-72 max-w-2xl flex-col items-center justify-center text-center" role="alert">
        <span className="rounded-full bg-critical/10 p-3 text-critical">
          <TriangleAlert className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-bold">تعذر عرض هذه الصفحة</h1>
        <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
          حدث خطأ أثناء عرض محتوى الصفحة. بقيت واجهة الإدارة فعّالة ويمكن إعادة محاولة تحميل الصفحة دون شاشة فارغة.
        </p>
        {import.meta.env.DEV ? (
          <p dir="ltr" className="mt-3 max-w-full overflow-auto rounded-md bg-muted p-3 text-start font-mono text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
        ) : null}
        <Button className="mt-5" variant="secondary" onClick={this.props.onRetry}>
          <RotateCcw className="size-4" />
          إعادة تحميل الصفحة
        </Button>
      </Card>
    );
  }
}

export function RouteRenderBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const resetKey = `${location.pathname}${location.search}`;

  return (
    <RouteBoundaryImpl
      resetKey={resetKey}
      onRetry={() => navigate(0)}
    >
      {children}
    </RouteBoundaryImpl>
  );
}
