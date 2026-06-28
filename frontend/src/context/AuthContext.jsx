import { createContext, useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/lib/authApi';

const AuthContext = createContext(null);
export const AUTH_QUERY_KEY = ['auth', 'me'];

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  const login = useCallback(
    (credentials) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

  const register = useCallback(
    (payload) => registerMutation.mutateAsync(payload),
    [registerMutation]
  );

  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation]
  );

  const value = useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'Admin',
      isLoading,
      isError,
      login,
      register,
      logout,
      refetchUser: refetch,
      isLoggingIn: loginMutation.isPending,
      isRegistering: registerMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      authError:
        loginMutation.error || registerMutation.error || null,
    }),
    [
      user,
      isLoading,
      isError,
      login,
      register,
      logout,
      refetch,
      loginMutation.isPending,
      registerMutation.isPending,
      logoutMutation.isPending,
      loginMutation.error,
      registerMutation.error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
