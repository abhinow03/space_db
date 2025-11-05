// API Configuration
export const API_BASE = "http://localhost:4000/api";

// API Helper Functions
export async function fetchAPI(endpoint: string, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Common API Functions
export const api = {
  get: (endpoint: string) => fetchAPI(endpoint),
  
  post: (endpoint: string, data: any) => fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint: string, data: any) => fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint: string) => fetchAPI(endpoint, {
    method: 'DELETE',
  }),
};