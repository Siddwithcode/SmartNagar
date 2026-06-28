import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSeverityBadgeClass, getStatusBadgeClass } from '@/lib/issueUtils';
import { cn } from '@/lib/utils';
import {
  ADMIN_ISSUES_KEY,
  bulkAdminAction,
  deleteAdminIssue,
} from '@/hooks/useAdmin';

export function RecentIssuesTable({
  issues,
  selectedIds,
  onSelect,
  onSelectAll,
  onStatusChange,
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteAdminIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ISSUES_KEY }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => bulkAdminAction({ issueIds: [id], action: 'verify' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ISSUES_KEY }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === issues.length}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue._id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(issue._id)}
                  onCheckedChange={(checked) => onSelect(issue._id, Boolean(checked))}
                />
              </TableCell>
              <TableCell>
                {issue.imageUrl ? (
                  <img src={issue.imageUrl} alt="" className="h-10 w-14 rounded-md object-cover" />
                ) : (
                  <div className="h-10 w-14 rounded-md bg-muted" />
                )}
              </TableCell>
              <TableCell className="max-w-[180px] truncate font-medium">{issue.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{issue.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('border', getSeverityBadgeClass(issue.severityScore))}>
                  {issue.severityScore}
                </Badge>
              </TableCell>
              <TableCell>{issue.reportedBy?.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('border', getStatusBadgeClass(issue.status))}>
                  {issue.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => verifyMutation.mutate(issue._id)}>
                      Verify
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(issue._id, 'In Progress')}>
                      Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(issue._id, 'Resolved')}>
                      Mark Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(issue._id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
