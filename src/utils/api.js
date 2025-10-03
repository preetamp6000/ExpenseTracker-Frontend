const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle validation errors specifically
      if (response.status === 400 && data.errors) {
        const validationErrors = data.errors.map(error => error.message).join(', ')
        throw new Error(`Validation failed: ${validationErrors}`)
      }
      throw new Error(data.message || `Request failed with status ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  }),
  
  register: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: userData
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  })
}

// Expense API
export const expenseAPI = {
  getExpenses: (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    return apiRequest(`/expenses${queryString ? `?${queryString}` : ''}`)
  },
  
  addExpense: (data) => apiRequest('/expenses', {
    method: 'POST',
    body: data
  }),
  
  updateExpense: (id, data) => apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  deleteExpense: (id) => apiRequest(`/expenses/${id}`, {
    method: 'DELETE'
  })
}

// Profile API
export const profileAPI = {
  getProfile: () => apiRequest('/profile'),
  
  updateProfile: (data) => apiRequest('/profile', {
    method: 'PUT',
    body: data
  })
}