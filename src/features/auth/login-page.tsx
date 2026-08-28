import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';

import { Button, Checkbox, Input } from '@/components/ui';
import { useSession } from './session';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'أدخل اسم المستخدم.'),
  password: z.string().min(1, 'أدخل كلمة المرور.'),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { session, login } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: true,
    },
  });

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const fromState = location.state as { from?: string } | null;

  // Only redirect to internal routes after a successful login.
  const destination =
    fromState?.from?.startsWith('/')
      ? fromState.from
      : '/dashboard';

  const onSubmit = (values: LoginValues) => {
    if (isLoggingIn) {
      return;
    }

    setAuthError('');
    setIsLoggingIn(true);

    const authenticated = login(
      values.username,
      values.password,
      values.remember,
    );

    if (!authenticated) {
      setAuthError(
        'اسم المستخدم أو كلمة المرور غير صحيحة. تحقق من البيانات وحاول مرة أخرى.',
      );
      setIsLoggingIn(false);
      return;
    }

    // Keep the loading state active until navigation finishes.
    navigate(destination, { replace: true });
  };

  return (
    <main className="flex min-h-screen min-h-dvh items-center justify-center bg-background px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-border/70 bg-surface p-6 shadow-card sm:p-8">
        <div className="mb-8 text-center">
          <div
            dir="ltr"
            className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-black tracking-[-0.06em] text-primary-foreground"
          >
            ResQ
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-foreground">
            تسجيل الدخول
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            أدخل بيانات حسابك للوصول إلى لوحة إدارة ResQ.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              اسم المستخدم
            </label>

            <Input
              id="username"
              autoComplete="username"
              dir="ltr"
              placeholder="username"
              disabled={isLoggingIn}
              className="h-12 w-full rounded-xl px-4 text-left"
              {...register('username')}
            />

            {errors.username && (
              <p className="mt-1.5 text-xs font-medium text-critical">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              كلمة المرور
            </label>

            <div className="relative" dir="ltr">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                dir="ltr"
                disabled={isLoggingIn}
                className="h-12 w-full rounded-xl pl-4 pr-11 text-left"
                {...register('password')}
              />

              <button
                type="button"
                disabled={isLoggingIn}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-critical">
                {errors.password.message}
              </p>
            )}
          </div>

          <Checkbox
            checked={watch('remember')}
            disabled={isLoggingIn}
            onCheckedChange={(checked) =>
              setValue('remember', checked === true)
            }
            label="تذكر تسجيل الدخول"
          />

          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-critical/15 bg-critical/5 px-4 py-3 text-sm leading-6 text-critical"
            >
              {authError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isLoggingIn}
            aria-busy={isLoggingIn}
            className="h-12 w-full rounded-xl font-bold"
          >
            {isLoggingIn ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                تسجيل الدخول
              </>
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}