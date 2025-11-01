// Use relative URL to leverage Vite's proxy in development
// In production, this will be the deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API Utility Functions
 * Handles all HTTP requests to the backend with authentication
 */

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Authentication APIs
export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
};

// Event APIs
export const eventAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/events`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (eventData) => {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  update: async (id, eventData) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Swap APIs
export const swapAPI = {
  getSwappableSlots: async () => {
    const response = await fetch(`${API_URL}/swappable-slots`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createSwapRequest: async (mySlotId, theirSlotId) => {
    const response = await fetch(`${API_URL}/swap-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mySlotId, theirSlotId }),
    });
    return handleResponse(response);
  },

  respondToSwap: async (requestId, accept) => {
    const response = await fetch(`${API_URL}/swap-response/${requestId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accept }),
    });
    return handleResponse(response);
  },

  getIncomingRequests: async () => {
    const response = await fetch(`${API_URL}/swap-requests/incoming`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOutgoingRequests: async () => {
    const response = await fetch(`${API_URL}/swap-requests/outgoing`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Group APIs
export const groupAPI = {
  createGroup: async (name, groupType, description) => {
    const response = await fetch(`${API_URL}/groups/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, groupType, description }),
    });
    return handleResponse(response);
  },

  joinGroup: async (code) => {
    const response = await fetch(`${API_URL}/groups/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },

  getMyGroups: async () => {
    const response = await fetch(`${API_URL}/groups/my-groups`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  switchGroup: async (groupId) => {
    const response = await fetch(`${API_URL}/groups/switch/${groupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getGroupDetails: async (groupId) => {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  leaveGroup: async (groupId) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
