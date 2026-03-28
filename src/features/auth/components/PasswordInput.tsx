import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}

export function PasswordInput({ id, label, placeholder = '••••••••', error, registration }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...registration}
          className={error ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <span className="text-xs text-destructive font-medium">{error.message}</span>
      )}
    </div>
  );
}
