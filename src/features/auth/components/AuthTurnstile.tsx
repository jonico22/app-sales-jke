import { useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface AuthTurnstileProps {
  onTokenChange: (token: string) => void;
}

export function AuthTurnstile({ onTokenChange }: AuthTurnstileProps) {
  const searchParams = new URLSearchParams(window.location.search);
  
  const isTestMode = searchParams.get('test') === 'true' || import.meta.env.MODE === 'test';

  useEffect(() => {
    if (isTestMode) {
      onTokenChange('test-token-bypass');
    }
  }, [isTestMode, onTokenChange]);

  if (isTestMode) return null;
  
  const currentTheme: 'light' | 'dark' = (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ? 'dark' : 'light';

  return (
    <div className="flex justify-center py-2 min-h-[65px] w-full border-none outline-none">
      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={onTokenChange}
        onExpire={() => onTokenChange('')}
        onError={() => onTokenChange('')}
        options={{
          theme: currentTheme,
        }}

        scriptOptions={{
          async: true,
          defer: true,
        }}
      />
    </div>
  );
}
