import { useCallback, useState } from 'react';
import { AppSplashScreen } from '@/components/feedback/app-splash';
import { AppRouter } from '@/routes/app-router';

export function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const handleSplashComplete = useCallback(() => setIsBootstrapping(false), []);

  if (isBootstrapping) {
    return <AppSplashScreen onComplete={handleSplashComplete} />;
  }

  return <AppRouter />;
}
