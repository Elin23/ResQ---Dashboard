import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

type AppSplashScreenProps = {
  onComplete: () => void;
};

type AppInlineLoaderProps = {
  label?: string;
};

type LoaderSize =
  | 'small'
  | 'large';

const SPLASH_VISIBLE_DURATION = 1300;
const SPLASH_FADE_DURATION = 500;

const LETTER_DELAYS = [
  0,
  90,
  180,
  270,
] as const;

const DOT_DELAYS = [
  0,
  140,
  280,
] as const;

export function AppSplashScreen({
  onComplete,
}: AppSplashScreenProps) {
  const [isLeaving, setIsLeaving] =
    useState(false);

  useEffect(() => {
    const fadeTimer =
      window.setTimeout(() => {
        setIsLeaving(true);
      }, SPLASH_VISIBLE_DURATION);

    const completeTimer =
      window.setTimeout(() => {
        onComplete();
      }, SPLASH_VISIBLE_DURATION + SPLASH_FADE_DURATION);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={[
        'fixed inset-0 z-[100]',
        'grid place-items-center',
        'bg-background',
        'will-change-opacity',
        isLeaving
          ? 'pointer-events-none opacity-0'
          : 'opacity-100',
      ].join(' ')}
      style={{
        transitionProperty: 'opacity',
        transitionDuration:
          `${SPLASH_FADE_DURATION}ms`,
        transitionTimingFunction:
          'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      role="status"
      aria-live="polite"
      aria-label="جارٍ تجهيز لوحة ResQ"
    >
      <div
        className="
          relative
          flex
          flex-col
          items-center
          px-6
          text-center
        "
      >
        <SplashDecoration />

        <div className="relative">
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-24
              w-56
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-primary/10
            "
            aria-hidden="true"
          />

          <AnimatedResQ
            size="large"
          />
        </div>

        <div
          className="
            mt-6
            h-px
            w-24
            bg-gradient-to-r
            from-transparent
            via-primary/50
            to-transparent
          "
          aria-hidden="true"
        />

        <p
          className="
            mt-4
            text-sm
            font-semibold
            text-foreground/80
          "
        >
          لوحة الإدارة التشغيلية
        </p>

        <p
          className="
            mt-1
            text-xs
            text-muted-foreground
          "
        >
          جارٍ تجهيز مساحة العمل
        </p>

        <AnimatedDots />

        <span className="sr-only">
          جارٍ تحميل لوحة إدارة ResQ
        </span>
      </div>
    </div>
  );
}

export function AppInlineLoader({
  label = 'جارٍ تحميل البيانات',
}: AppInlineLoaderProps) {
  return (
    <div
      className="
        flex
        min-h-40
        items-center
        justify-center
      "
      role="status"
      aria-live="polite"
    >
      <div
        className="
          flex
          flex-col
          items-center
          text-center
        "
      >
        <AnimatedResQ
          size="small"
        />

        <p
          className="
            mt-3
            text-sm
            font-medium
            text-muted-foreground
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function AnimatedResQ({
  size,
}: {
  size: LoaderSize;
}) {
  const rRef =
    useRef<HTMLSpanElement>(null);

  const eRef =
    useRef<HTMLSpanElement>(null);

  const sRef =
    useRef<HTMLSpanElement>(null);

  const qRef =
    useRef<HTMLSpanElement>(null);

  useLetterAnimation(
    rRef,
    LETTER_DELAYS[0],
  );

  useLetterAnimation(
    eRef,
    LETTER_DELAYS[1],
  );

  useLetterAnimation(
    sRef,
    LETTER_DELAYS[2],
  );

  useLetterAnimation(
    qRef,
    LETTER_DELAYS[3],
  );

  const sizeClass =
    size === 'large'
      ? 'text-[4.5rem] sm:text-[5.5rem]'
      : 'text-3xl';

  return (
    <div
      dir="ltr"
      className={[
        'relative',
        'flex',
        'items-baseline',
        'justify-center',
        'select-none',
        'font-black',
        'tracking-[-0.075em]',
        sizeClass,
      ].join(' ')}
      aria-label="ResQ"
    >
      <span
        ref={rRef}
        className="
          inline-block
          text-foreground
        "
      >
        R
      </span>

      <span
        ref={eRef}
        className="
          inline-block
          text-foreground
        "
      >
        e
      </span>

      <span
        ref={sRef}
        className="
          inline-block
          text-foreground
        "
      >
        s
      </span>

      <span
        ref={qRef}
        className="
          relative
          inline-block
          text-primary
        "
      >
        Q

        {size === 'large' && (
          <span
            className="
              pointer-events-none
              absolute
              -right-2
              -top-1
              size-2
              rounded-full
              bg-primary/45
            "
            aria-hidden="true"
          />
        )}
      </span>
    </div>
  );
}

function AnimatedDots() {
  const firstDotRef =
    useRef<HTMLSpanElement>(null);

  const secondDotRef =
    useRef<HTMLSpanElement>(null);

  const thirdDotRef =
    useRef<HTMLSpanElement>(null);

  useDotAnimation(
    firstDotRef,
    DOT_DELAYS[0],
  );

  useDotAnimation(
    secondDotRef,
    DOT_DELAYS[1],
  );

  useDotAnimation(
    thirdDotRef,
    DOT_DELAYS[2],
  );

  return (
    <div
      className="
        mt-7
        flex
        items-center
        gap-2
      "
      aria-hidden="true"
    >
      <span
        ref={firstDotRef}
        className="
          block
          size-1.5
          rounded-full
          bg-primary
        "
      />

      <span
        ref={secondDotRef}
        className="
          block
          size-1.5
          rounded-full
          bg-primary
        "
      />

      <span
        ref={thirdDotRef}
        className="
          block
          size-1.5
          rounded-full
          bg-primary
        "
      />
    </div>
  );
}

function useLetterAnimation(
  ref: RefObject<HTMLSpanElement | null>,
  delay: number,
) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const animation =
      element.animate(
        [
          {
            transform:
              'translateY(0) scale(1)',
          },

          {
            transform:
              'translateY(-12px) scale(1.035)',
            offset: 0.34,
          },

          {
            transform:
              'translateY(-3px) scale(1.01)',
            offset: 0.58,
          },

          {
            transform:
              'translateY(0) scale(1)',
          },
        ],
        {
          duration: 1100,
          delay,
          iterations: Infinity,

          easing:
            'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      );

    return () => {
      animation.cancel();
    };
  }, [delay, ref]);
}

function useDotAnimation(
  ref: RefObject<HTMLSpanElement | null>,
  delay: number,
) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const animation =
      element.animate(
        [
          {
            opacity: 0.25,
            transform:
              'translateY(0) scale(0.8)',
          },

          {
            opacity: 1,
            transform:
              'translateY(-5px) scale(1)',
          },

          {
            opacity: 0.25,
            transform:
              'translateY(0) scale(0.8)',
          },
        ],
        {
          duration: 900,
          delay,
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      );

    return () => {
      animation.cancel();
    };
  }, [delay, ref]);
}

function SplashDecoration() {
  return (
    <>
      <span
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          size-44
          rounded-full
          bg-primary/[0.07]
        "
        aria-hidden="true"
      />

      <span
        className="
          pointer-events-none
          absolute
          -bottom-20
          -right-24
          size-40
          rounded-full
          bg-primary/10
        "
        aria-hidden="true"
      />

      <span
        className="
          pointer-events-none
          absolute
          -left-10
          top-4
          size-1.5
          rounded-full
          bg-primary/40
        "
        aria-hidden="true"
      />

      <span
        className="
          pointer-events-none
          absolute
          -right-8
          bottom-7
          size-1
          rounded-full
          bg-primary/40
        "
        aria-hidden="true"
      />
    </>
  );
}
