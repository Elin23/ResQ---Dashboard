import { Home, RotateCcw, TriangleAlert } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button, Card } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep technical diagnostics available during frontend development without exposing them in the UI.
    if (import.meta.env.DEV) {
      console.error('[app-render-error]', error, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main dir="rtl" lang="ar" className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-xl text-center" role="alert" aria-live="assertive">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-critical/10 text-critical" aria-hidden="true">
            <TriangleAlert className="size-7" />
          </span>

          <h1 className="mt-4 text-xl font-bold">حدث خطأ غير متوقع</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تعذر عرض الواجهة الحالية. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
          </p>

          {import.meta.env.DEV && this.state.errorMessage ? (
            <p dir="ltr" className="mt-3 max-h-36 overflow-auto rounded-md bg-muted p-3 text-start font-mono text-xs text-muted-foreground">
              {this.state.errorMessage}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => globalThis.location.reload()}>
              <RotateCcw className="size-4" />
              إعادة المحاولة
            </Button>

            <Button onClick={() => globalThis.location.assign('/#/dashboard')}>
              <Home className="size-4" />
              العودة إلى الرئيسية
            </Button>
          </div>
        </Card>
      </main>
    );
  }
}
