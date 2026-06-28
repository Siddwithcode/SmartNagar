import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  Award,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Percent,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { RecentIssuesTable } from '@/components/admin/RecentIssuesTable';
import { StatsCard } from '@/components/admin/StatsCard';
import { TopCitizensTable } from '@/components/admin/TopCitizensTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ADMIN_ANALYTICS_KEY,
  ADMIN_ISSUES_KEY,
  bulkAdminAction,
  useAdminAnalytics,
  useAdminIssues,
  useAdminStats,
  useTopCitizens,
} from '@/hooks/useAdmin';
import { downloadCSV, downloadExcel, downloadPDF } from '@/lib/exportUtils';
import api from '@/lib/axios';

const STATUSES = ['Pending', 'Verified', 'In Progress', 'Resolved'];
const CATEGORIES = [
  'Pot-hole',
  'Waste Management',
  'Streetlight',
  'Stray Animals',
  'Public Infrastructure',
];

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    severity: '',
    startDate: '',
    endDate: '',
  });
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: citizens, isLoading: citizensLoading } = useTopCitizens();
  const { data: issues = [], isLoading: issuesLoading } = useAdminIssues(filters);

  const bulkMutation = useMutation({
    mutationFn: bulkAdminAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ISSUES_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ANALYTICS_KEY });
      setSelectedIds([]);
    },
  });

  const updateStatus = async (issueId, status) => {
    await api.patch(`/issues/${issueId}/status`, { status });
    queryClient.invalidateQueries({ queryKey: ADMIN_ISSUES_KEY });
  };

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? issues.map((issue) => issue._id) : []);
  };

  const exportRows = issues.map((issue) => ({
    title: issue.title,
    category: issue.category,
    severity: issue.severityScore,
    status: issue.status,
    reporter: issue.reportedBy?.name,
    createdAt: new Date(issue.createdAt).toLocaleDateString(),
  }));

  const statCards = stats
    ? [
        { title: 'Total Issues', value: stats.totalIssues, icon: FileText },
        { title: 'Pending Issues', value: stats.pendingIssues, icon: Clock },
        { title: 'Verified Issues', value: stats.verifiedIssues, icon: ShieldCheck },
        { title: 'In Progress', value: stats.inProgressIssues, icon: Wrench },
        { title: 'Resolved Issues', value: stats.resolvedIssues, icon: CheckCircle2 },
        { title: 'Avg Severity', value: stats.avgSeverity, icon: Activity },
        { title: 'Top Category', value: stats.mostCommonCategory, icon: Target },
        { title: 'Total Citizens', value: stats.totalCitizens, icon: Users },
        { title: 'Active Citizens', value: stats.activeCitizens, icon: TrendingUp },
        { title: 'AI Reports', value: stats.aiReportsProcessed, icon: Bot },
        { title: 'Civic Points', value: stats.totalCivicPoints, icon: Award },
        { title: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: Percent },
      ]
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))
          : statCards.map((card) => <StatsCard key={card.title} {...card} />)}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="citizens">Citizens</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AnalyticsCharts analytics={analytics} isLoading={analyticsLoading} />
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Resolution Time</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {analytics.avgResolutionTimeHours}h
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Most Reported Area</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{analytics.mostReportedArea}</CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Highest Severity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {analytics.highestSeverityIssue?.title ?? 'N/A'}
                  <p className="text-muted-foreground">
                    Score: {analytics.highestSeverityIssue?.severity ?? '-'}
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{analytics.aiAccuracy}%</CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Filters & Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <Input
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === 'all' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value === 'all' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Severity"
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                />
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!selectedIds.length}
                  onClick={() =>
                    bulkMutation.mutate({ issueIds: selectedIds, action: 'verify' })
                  }
                >
                  Verify Selected
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedIds.length}
                  onClick={() =>
                    bulkMutation.mutate({
                      issueIds: selectedIds,
                      action: 'changeStatus',
                      status: 'Resolved',
                    })
                  }
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="destructive"
                  disabled={!selectedIds.length}
                  onClick={() =>
                    bulkMutation.mutate({ issueIds: selectedIds, action: 'delete' })
                  }
                >
                  Delete Selected
                </Button>
                <Button variant="secondary" onClick={() => downloadCSV('issues.csv', exportRows)}>
                  Download CSV
                </Button>
                <Button variant="secondary" onClick={() => downloadExcel('issues.xlsx', exportRows)}>
                  Download Excel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => downloadPDF('SmartNagar Issues Report', JSON.stringify(exportRows, null, 2))}
                >
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {issuesLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <RecentIssuesTable
              issues={issues}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onStatusChange={updateStatus}
            />
          )}
        </TabsContent>

        <TabsContent value="citizens">
          <TopCitizensTable citizens={citizens ?? []} isLoading={citizensLoading} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsCharts analytics={analytics} isLoading={analyticsLoading} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
