# Frontend-Backend Integration Guide

This document explains how the admin frontend is connected to the backend API.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Admin Panel   │ ◄──────────────► │   Backend API   │
│   (React)       │                  │   (Node.js)     │
│   Port: 3000    │                  │   Port: 8000    │
└─────────────────┘                  └─────────────────┘
```

## 🔧 **Configuration**

### **Backend API URL**

The frontend connects to the backend using the following configuration:

```javascript
// admin/src/api/adminAPI.js
const adminAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### **Environment Variables**

Create a `.env` file in the admin directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🔐 **Authentication Flow**

### **1. Login Process**

```javascript
// Frontend sends credentials
const response = await authAPI.login({
  email: 'admin@beaten.com',
  password: 'Admin123!'
});

// Backend returns JWT token
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "_id": "admin_id",
    "name": "Admin",
    "email": "admin@beaten.com",
    "role": "admin",
    "permissions": { ... },
    "token": "jwt_token_here"
  }
}
```

### **2. Token Storage**

- Token is stored in `localStorage` as `admin_token`
- Automatically added to all API requests via axios interceptor

### **3. Protected Routes**

- All admin routes require valid JWT token
- Token is validated on backend for each request
- Expired/invalid tokens redirect to login

## 📡 **API Endpoints**

### **Authentication Endpoints**

| Method | Endpoint                     | Description          | Auth Required |
| ------ | ---------------------------- | -------------------- | ------------- |
| POST   | `/api/admin/register`        | Register new admin   | No            |
| POST   | `/api/admin/login`           | Admin login          | No            |
| GET    | `/api/admin/profile`         | Get admin profile    | Yes           |
| PUT    | `/api/admin/profile`         | Update admin profile | Yes           |
| PUT    | `/api/admin/change-password` | Change password      | Yes           |
| POST   | `/api/admin/logout`          | Admin logout         | Yes           |

### **Health Check**

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | API health status |

## 🛠️ **Implementation Details**

### **1. API Service Layer**

```javascript
// admin/src/api/adminAPI.js
export const authAPI = {
  login: async (credentials) => {
    const response = await adminAPI.post("/admin/login", credentials);
    return response.data;
  },
  // ... other methods
};
```

### **2. Authentication Context**

```javascript
// admin/src/context/AuthContext.js
const login = async (credentials) => {
  const res = await authAPI.login(credentials);
  if (res.data.token) {
    localStorage.setItem("admin_token", res.data.token);
    setUser(res.data);
  }
};
```

### **3. Request Interceptors**

```javascript
// Automatically add token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **4. Response Interceptors**

```javascript
// Handle authentication errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

## 🧪 **Testing the Integration**

### **1. Manual Testing**

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd admin && npm start`
3. Open browser: `http://localhost:3000`
4. Login with: `admin@beaten.com` / `Admin123!`

### **2. API Testing**

```bash
# Test health check
curl http://localhost:8000/api/health

# Test admin login
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@beaten.com", "password": "Admin123!"}'
```

### **3. Browser Console Testing**

```javascript
// Run in browser console
const testBackendConnection = async () => {
  const response = await fetch("http://localhost:8000/api/health");
  const data = await response.json();
  console.log("Backend Status:", data);
};
```

## 🔒 **Security Features**

### **1. JWT Authentication**

- Tokens include admin type verification
- Automatic token expiration handling
- Secure token storage in localStorage

### **2. Input Validation**

- Frontend validation matches backend requirements
- Strong password requirements enforced
- Email format validation

### **3. Error Handling**

- Comprehensive error messages
- Graceful fallback for network issues
- Automatic logout on authentication failures

## 🚀 **Deployment Considerations**

### **1. Environment Variables**

```env
# Production
REACT_APP_API_URL=https://your-api-domain.com/api

# Development
REACT_APP_API_URL=http://localhost:8000/api
```

### **2. CORS Configuration**

Backend is configured to allow requests from:

- `http://localhost:3000` (development)
- `https://your-frontend-domain.com` (production)

### **3. HTTPS**

- Use HTTPS in production
- Secure cookie settings
- HSTS headers

## 📊 **Monitoring & Debugging**

### **1. Network Tab**

- Check API requests in browser dev tools
- Verify request/response headers
- Monitor authentication flow

### **2. Console Logs**

- Frontend logs in browser console
- Backend logs in terminal
- API error responses

### **3. Connection Test Component**

The admin panel includes a `ConnectionTest` component that:

- Tests backend connectivity
- Shows connection status
- Displays error messages
- Allows manual reconnection

## 🎯 **Current Status**

✅ **Backend API**: Running on port 8000  
✅ **Admin Frontend**: Running on port 3000  
✅ **Authentication**: JWT-based with admin tokens  
✅ **Protected Routes**: Working with token validation  
✅ **Error Handling**: Comprehensive error management  
✅ **CORS**: Properly configured for cross-origin requests

## 🔄 **Next Steps**

1. **Remove Connection Test**: Remove the test component from production
2. **Add Loading States**: Improve UX with better loading indicators
3. **Error Boundaries**: Add React error boundaries for better error handling
4. **Offline Support**: Add offline detection and handling
5. **Token Refresh**: Implement automatic token refresh mechanism
