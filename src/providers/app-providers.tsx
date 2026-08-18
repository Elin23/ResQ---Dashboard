import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  useState,
  type ReactNode,
} from 'react';

import {
  HashRouter,
} from 'react-router';

import {
  Toaster,
} from 'sonner';

import {
  SessionProvider,
} from '@/features/auth/session';

import {
  env,
} from '@/config/env';

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] =
    useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime:
                env.dataSource ===
                'mock'
                  ? Infinity
                  : 30_000,

              gcTime:
                30 *
                60_000,

              retry:
                1,

              refetchOnWindowFocus:
                false,
            },

            mutations: {
              retry:
                0,
            },
          },
        }),
    );

  return (
    <HashRouter>
      <QueryClientProvider
        client={
          queryClient
        }
      >
        <SessionProvider>
          {children}

          <Toaster
            position="top-center"
            richColors
            closeButton
            dir="rtl"
          />
        </SessionProvider>
      </QueryClientProvider>
    </HashRouter>
  );
}