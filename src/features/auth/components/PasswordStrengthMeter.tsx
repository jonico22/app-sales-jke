import { useMemo } from 'react';
import { Info } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length > 0) {
      if (password.length >= 8) score += 33;
      if (/[0-9]/.test(password)) score += 33;
      if (/[^a-zA-Z0-9]/.test(password)) score += 34;
    }
    return Math.min(score, 100);
  }, [password]);

  const strengthColor = useMemo(() => {
    if (strength < 34) return 'bg-red-500';
    if (strength < 67) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [strength]);

  const strengthText = useMemo(() => {
    if (strength === 0) return '';
    if (strength < 34) return 'Débil';
    if (strength < 67) return 'Media';
    return 'Fuerte';
  }, [strength]);

  return (
    <div className="bg-muted p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-foreground">Fortaleza de la contraseña</span>
        <span className="text-muted-foreground font-medium">
          {strengthText && `${strengthText} (${Math.round(strength)}%)`}
        </span>
      </div>
      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${strength}%` }}
        ></div>
      </div>
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-snug">
          La contraseña debe tener al menos 8 caracteres, incluir un número y un símbolo especial.
        </p>
      </div>
    </div>
  );
}
