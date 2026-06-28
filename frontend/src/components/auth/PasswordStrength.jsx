import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/passwordStrength';

export function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-300', strength.color)}
          style={{ width: strength.width }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
    </div>
  );
}
