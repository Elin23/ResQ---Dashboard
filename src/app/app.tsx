import { useCallback, useState } from 'react';
import { AppSplashScreen } from '@/components/feedback/app-splash';
import { AppRouter } from '@/routes/app-router';

export function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const handleSplashComplete = useCallback(() => setIsBootstrapping(false), []);

  // Do not render the complete application underneath a full-screen splash.
  // This avoids competing initial paints, hidden route work, and overlay artifacts.
  if (isBootstrapping) {
    return <AppSplashScreen onComplete={handleSplashComplete} />;
  }

  return <AppRouter />;
}
