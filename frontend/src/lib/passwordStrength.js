export function getPasswordStrength(password = '') {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', width: '33%' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500', width: '66%' };
  return { score, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
}
