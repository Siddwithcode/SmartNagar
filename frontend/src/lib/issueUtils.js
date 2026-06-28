export function getSeverityBadgeClass(score) {
  if (score >= 8) {
    return 'border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300';
  }
  if (score >= 4) {
    return 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300';
  }
  return 'border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300';
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'Verified':
      return 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300';
    case 'In Progress':
      return 'border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300';
    case 'Resolved':
      return 'border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}
