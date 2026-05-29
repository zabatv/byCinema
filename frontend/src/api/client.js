const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, auth = true, params } = options;

  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: data, auth: false }),
    login: (data) => request('/auth/login', { method: 'POST', body: data, auth: false }),
    me: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),
  },
  movies: {
    list: (params) => request('/movies', { params }),
    get: (slug) => request(`/movies/${slug}`),
    create: (data) => request('/movies', { method: 'POST', body: data }),
    update: (id, data) => request(`/movies/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/movies/${id}`, { method: 'DELETE' }),
  },
  products: {
    list: (params) => request('/products', { params, auth: false }),
    get: (slug) => request(`/products/${slug}`, { auth: false }),
    create: (data) => request('/products', { method: 'POST', body: data }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  collections: {
    list: () => request('/collections', { auth: false }),
    get: (slug) => request(`/collections/${slug}`, { auth: false }),
    create: (data) => request('/collections', { method: 'POST', body: data }),
    update: (id, data) => request(`/collections/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/collections/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (data) => request('/orders', { method: 'POST', body: data }),
  },
  admin: {
    stats: () => request('/admin/stats'),
    orders: (params) => request('/admin/orders', { params }),
    updateOrderStatus: (id, status) =>
      request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } }),
    users: () => request('/admin/users'),
  },
};

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}
