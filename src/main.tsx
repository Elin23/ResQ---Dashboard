import { createRoot } from 'react-dom/client';

import { App } from '@/app/app';
import { AppErrorBoundary } from '@/app/error-boundary';
import { AppProviders } from '@/providers/app-providers';

import '@/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found');
}

createRoot(rootElement).render(
  <AppErrorBoundary>
    <AppProviders>
      <App />
    </AppProviders>
  </AppErrorBoundary>,
);