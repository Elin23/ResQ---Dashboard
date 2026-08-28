import { useEffect, useState, type CSSProperties } from 'react';

type AppSplashScreenProps = {
  onComplete: () => void;
};

type AppInlineLoaderProps = {
  label?: string;
};

type LoaderSize = 'small' | 'large';

const SPLASH_VISIBLE_DURATION = 1900;
const SPLASH_FADE_DURATION = 350;

export function AppSplashScreen({ onComplete }: AppSplashScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, SPLASH_VISIBLE_DURATION);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, SPLASH_VISIBLE_DURATION + SPLASH_FADE_DURATION);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`resq-splash fixed inset-0 z-[100] grid place-items-center bg-background ${isLeaving ? 'resq-splash--leaving pointer-events-none' : ''}`}
      style={{ '--resq-splash-fade-duration': `${SPLASH_FADE_DURATION}ms` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="جارٍ فتح لوحة إدارة ResQ"
    >
      <div className="resq-splash__content relative flex flex-col items-center px-6 text-center">
        <SplashDecoration />

        <div className="relative">
          <div className="resq-splash__glow pointer-events-none absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10" aria-hidden="true" />
          <AnimatedResQ size="large" />
        </div>

        <div className="resq-splash__divider mt-6 h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" aria-hidden="true" />

        <div className="resq-splash__copy">
          <p className="mt-4 text-sm font-semibold text-foreground/80">ResQ Admin</p>
          <p className="mt-1 text-xs text-muted-foreground">جارٍ فتح لوحة الإدارة</p>
        </div>

        <AnimatedDots />
        <span className="sr-only">جارٍ فتح لوحة إدارة ResQ</span>
      </div>
    </div>
  );
}

export function AppInlineLoader({ label = 'جارٍ تحميل البيانات' }: AppInlineLoaderProps) {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <AnimatedResQ size="small" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function AnimatedResQ({ size }: { size: LoaderSize }) {
  const sizeClass = size === 'large' ? 'text-[4.5rem] sm:text-[5.5rem]' : 'text-3xl';

  return (
    <div dir="ltr" className={`relative flex items-baseline justify-center select-none font-black tracking-[-0.075em] ${sizeClass}`} aria-label="ResQ">
      <span className="resq-logo-letter resq-logo-letter--1 inline-block text-foreground">R</span>
      <span className="resq-logo-letter resq-logo-letter--2 inline-block text-foreground">e</span>
      <span className="resq-logo-letter resq-logo-letter--3 inline-block text-foreground">s</span>
      <span className="resq-logo-letter resq-logo-letter--4 relative inline-block text-primary">
        Q
        {size === 'large' && <span className="resq-splash__accent pointer-events-none absolute -right-2 -top-1 size-2 rounded-full bg-primary/45" aria-hidden="true" />}
      </span>
    </div>
  );
}

function AnimatedDots() {
  return (
    <div className="mt-7 flex items-center gap-2" aria-hidden="true">
      <span className="resq-loading-dot resq-loading-dot--1 block size-1.5 rounded-full bg-primary" />
      <span className="resq-loading-dot resq-loading-dot--2 block size-1.5 rounded-full bg-primary" />
      <span className="resq-loading-dot resq-loading-dot--3 block size-1.5 rounded-full bg-primary" />
    </div>
  );
}

function SplashDecoration() {
  return (
    <>
      <span className="resq-splash__orb resq-splash__orb--one pointer-events-none absolute -left-24 -top-24 size-44 rounded-full bg-primary/[0.07]" aria-hidden="true" />
      <span className="resq-splash__orb resq-splash__orb--two pointer-events-none absolute -bottom-20 -right-24 size-40 rounded-full bg-primary/10" aria-hidden="true" />
      <span className="resq-splash__spark resq-splash__spark--one pointer-events-none absolute -left-10 top-4 size-1.5 rounded-full bg-primary/40" aria-hidden="true" />
      <span className="resq-splash__spark resq-splash__spark--two pointer-events-none absolute -right-8 bottom-7 size-1 rounded-full bg-primary/40" aria-hidden="true" />
    </>
  );
}
