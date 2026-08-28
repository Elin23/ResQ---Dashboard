import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { HashRouter } from 'react-router';
import { Toaster } from 'sonner';

import { env } from '@/config/env';
import { SessionProvider } from '@/features/auth/session';

export function AppProviders({ children }: { children: ReactNode }) {
  // Keep one QueryClient instance for the whole app to avoid resetting cached server state on re-renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mock data does not change externally, so it can stay fresh indefinitely.
            staleTime: env.dataSource === 'mock' ? Infinity : 30_000,
            gcTime: 30 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Mutations should surface failures immediately instead of retrying destructive actions.
            retry: 0,
          },
        },
      }),
  );

  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
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