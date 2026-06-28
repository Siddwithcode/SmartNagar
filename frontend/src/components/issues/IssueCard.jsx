import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UpvoteButton } from '@/components/issues/UpvoteButton';
import { getSeverityBadgeClass, getStatusBadgeClass } from '@/lib/issueUtils';
import { cn } from '@/lib/utils';

export function IssueCard({ issue, currentUserId, onVerify, isVerifying, verifyingId }) {
  const upvoteCount = issue.upvotes?.length ?? 0;
  const reporterId = issue.reportedBy?._id ?? issue.reportedBy;
  const isOwnIssue = currentUserId && reporterId?.toString() === currentUserId.toString();
  const hasUpvoted =
    currentUserId &&
    issue.upvotes?.some((vote) => {
      const voteId = vote?._id ?? vote;
      return voteId?.toString() === currentUserId.toString();
    });
  const isThisVerifying = isVerifying && verifyingId === issue._id;

  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40" />
          </div>
        )}
      </div>

      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{issue.category}</Badge>
          <Badge
            variant="outline"
            className={cn('border', getSeverityBadgeClass(issue.severityScore))}
          >
            Severity {issue.severityScore}/10
          </Badge>
          <Badge
            variant="outline"
            className={cn('border', getStatusBadgeClass(issue.status))}
          >
            {issue.status}
          </Badge>
        </div>
        <CardTitle className="text-base leading-snug">{issue.title}</CardTitle>
        <CardDescription className="line-clamp-2">{issue.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {issue.aiSummary && (
          <p className="text-xs text-muted-foreground italic">AI: {issue.aiSummary}</p>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Reported by {issue.reportedBy?.name ?? 'Citizen'}
        </p>
        <UpvoteButton
          count={upvoteCount}
          disabled={isOwnIssue || hasUpvoted}
          isLoading={isThisVerifying}
          onUpvote={() => onVerify(issue._id)}
        />
      </CardFooter>
    </Card>
  );
}
