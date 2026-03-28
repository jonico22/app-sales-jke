import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';

interface AuthTurnstileProps {
  onTokenChange: (token: string) => void;
}

export function AuthTurnstile({ onTokenChange }: AuthTurnstileProps) {
  const [searchParams] = useSearchParams();
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    const isTest = searchParams.get('test') === 'true' || import.meta.env.MODE === 'test';
    setIsTestMode(isTest);
    if (isTest) {
      onTokenChange('test-token-bypass');
    }
  }, [searchParams, onTokenChange]);

  if (isTestMode) return null;
  
  const currentTheme = (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ? 'dark' : 'light';

  return (
    <div className="flex justify-center py-2 min-h-[65px] w-full border-none outline-none">
      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={onTokenChange}
        onExpire={() => onTokenChange('')}
        onError={() => onTokenChange('')}
        options={{
          theme: currentTheme as any,
        }}

        scriptOptions={{
          async: true,
          defer: true,
        }}
      />
    </div>
  );
}
