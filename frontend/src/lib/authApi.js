import api from '@/lib/axios';

export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  });
  return data;
}

export async function fetchCurrentUser() {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    if (!error.response || error.response.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logoutUser() {
  const { data } = await api.post('/auth/logout');
  return data;
}
