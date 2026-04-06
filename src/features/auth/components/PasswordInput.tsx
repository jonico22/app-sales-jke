import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: { message?: string } | string;
}

export function PasswordInput({ id, label, placeholder = '••••••••', error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...props}
          className={errorMessage ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none rounded-md hover:bg-muted/30"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {errorMessage && (
        <span className="text-xs text-destructive font-medium">{errorMessage}</span>
      )}
    </div>
  );
}
