import { useState } from 'react';
import { AlertCircle, LayoutGrid } from 'lucide-react';
import { IssueCard } from '@/components/issues/IssueCard';
import { ReportModal } from '@/components/issues/ReportModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/hooks/useIssues';

export default function Dashboard() {
  const { user } = useAuth();
  const { issues, isLoading, isError, error, verifyIssue, isVerifying } = useIssues();
  const [verifyingId, setVerifyingId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const handleVerify = (issueId) => {
    setVerifyingId(issueId);
    verifyIssue(issueId, {
      onSettled: () => setVerifyingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading issues...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">
          Failed to load issues: {error?.response?.data?.message || error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Community-reported civic issues across Smartnagar
          </p>
        </div>
        <Button onClick={() => setReportOpen(true)}>Report Issue</Button>
      </div>

      {issues.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No issues reported yet.</p>
          <Button variant="outline" onClick={() => setReportOpen(true)}>
            Report the first issue
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              currentUserId={user?._id}
              onVerify={handleVerify}
              isVerifying={isVerifying}
              verifyingId={verifyingId}
            />
          ))}
        </div>
      )}

      <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
