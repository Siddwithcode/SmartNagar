import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const ADMIN_STATS_KEY = ['admin', 'stats'];
export const ADMIN_ANALYTICS_KEY = ['admin', 'analytics'];
export const ADMIN_CITIZENS_KEY = ['admin', 'citizens'];
export const ADMIN_ISSUES_KEY = ['admin', 'issues'];

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function fetchAdminAnalytics() {
  const { data } = await api.get('/admin/analytics');
  return data;
}

export async function fetchTopCitizens() {
  const { data } = await api.get('/admin/citizens');
  return data;
}

export async function fetchAdminIssues(filters = {}) {
  const { data } = await api.get('/admin/issues', { params: filters });
  return data;
}

export async function deleteAdminIssue(id) {
  const { data } = await api.delete(`/admin/issues/${id}`);
  return data;
}

export async function bulkAdminAction(payload) {
  const { data } = await api.post('/admin/issues/bulk', payload);
  return data;
}

export function useAdminStats() {
  return useQuery({ queryKey: ADMIN_STATS_KEY, queryFn: fetchAdminStats });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ADMIN_ANALYTICS_KEY, queryFn: fetchAdminAnalytics });
}

export function useTopCitizens() {
  return useQuery({ queryKey: ADMIN_CITIZENS_KEY, queryFn: fetchTopCitizens });
}

export function useAdminIssues(filters) {
  return useQuery({
    queryKey: [...ADMIN_ISSUES_KEY, filters],
    queryFn: () => fetchAdminIssues(filters),
  });
}
