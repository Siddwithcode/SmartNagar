import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UpvoteButton({
  count,
  disabled,
  isLoading,
  onUpvote,
  className,
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isLoading}
      onClick={onUpvote}
      className={cn('gap-1.5', className)}
    >
      <ThumbsUp className="h-3.5 w-3.5" />
      {isLoading ? 'Verifying...' : `Verify (${count})`}
    </Button>
  );
}
