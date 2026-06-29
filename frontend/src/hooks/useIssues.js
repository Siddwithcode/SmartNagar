import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const ISSUES_QUERY_KEY = ['issues'];

export async function getIssues() {
  const { data } = await api.get('/issues');
  return data;
}

export async function createIssue({ description, image }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('image', image);

  // Let axios set Content-Type with boundary — manual header breaks uploads on production
  const { data } = await api.post('/issues/report', formData);

  return data;
}

export async function verifyIssue(issueId) {
  const { data } = await api.patch(`/issues/${issueId}/verify`);
  return data;
}

export function useIssues() {
  const queryClient = useQueryClient();

  const issuesQuery = useQuery({
    queryKey: ISSUES_QUERY_KEY,
    queryFn: getIssues,
  });

  const createIssueMutation = useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

  const verifyIssueMutation = useMutation({
    mutationFn: verifyIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

  return {
    issues: issuesQuery.data ?? [],
    isLoading: issuesQuery.isLoading,
    isError: issuesQuery.isError,
    error: issuesQuery.error,
    refetch: issuesQuery.refetch,
    createIssue: createIssueMutation.mutate,
    createIssueAsync: createIssueMutation.mutateAsync,
    isCreating: createIssueMutation.isPending,
    createError: createIssueMutation.error,
    verifyIssue: verifyIssueMutation.mutate,
    verifyIssueAsync: verifyIssueMutation.mutateAsync,
    isVerifying: verifyIssueMutation.isPending,
    verifyError: verifyIssueMutation.error,
  };
}
