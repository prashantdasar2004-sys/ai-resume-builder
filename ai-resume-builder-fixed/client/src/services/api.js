const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const fetchApi = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] =
      'application/json';
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: 'include',
    }
  );

  let json = {};

  try {
    json = await response.json();
  } catch (error) {
    json = {
      message: 'Invalid server response',
    };
  }

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  if (!response.ok) {
    const error = new Error(
      json.message || 'Request failed'
    );

    error.response = {
      data: json,
      status: response.status,
    };

    throw error;
  }

  return json.data !== undefined
    ? json.data
    : json;
};

const API = {
  get: endpoint => fetchApi(endpoint),

  post: (endpoint, body) =>
    fetchApi(endpoint, {
      method: 'POST',
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: endpoint =>
    fetchApi(endpoint, {
      method: 'DELETE',
    }),
};

export default API;
