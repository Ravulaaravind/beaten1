# Admin Panel - Dummy Data Implementation

## Overview

This admin panel has been configured to use dummy data instead of real backend API calls. All API endpoints have been replaced with mock data that simulates real responses.

## Features

- **Authentication**: Login and registration system with route protection
- **Dashboard**: Shows mock statistics, sales trends, category distribution, recent activities, and top products
- **Products**: Full CRUD operations with mock product data
- **Orders**: View and update order statuses with mock order data
- **Customers**: View customer information with mock customer data
- **Promotions**: Create and manage promotional codes with mock data

## Authentication

### Login Credentials

- **Email**: admin@beaten.com
- **Password**: admin123

### Registration

- New users can register for admin accounts
- Registration includes validation for email, password strength, and password confirmation
- After successful registration, users are redirected to login page
- Registration supports different roles: Admin, Manager, Staff

### Route Protection

- **Public Routes**: Login and Register pages (redirect authenticated users to dashboard)
- **Protected Routes**: All admin dashboard pages (redirect unauthenticated users to login)
- **Loading States**: Shows spinner while checking authentication status

## Dummy Data Structure

### Dashboard Data

- Total Revenue: ₹125,000
- Total Orders: 1,247
- Total Customers: 892
- Total Products: 156
- Revenue Growth: 12.5%
- Orders Growth: 8.3%
- Customers Growth: 15.2%
- Products Growth: 5.7%
- Sales trends for the last 30 days
- Category distribution charts
- Recent activities feed
- Top performing products

### Products Data

- 5 sample products with realistic data
- Categories: T-shirts, Hoodies, Jackets, Cargo Pants, Sneakers
- Price range: ₹29.99 - ₹89.99
- Stock levels and status tracking
- Rating and review data

### Orders Data

- 3 sample orders with different statuses
- Customer information
- Order items and totals
- Status tracking (Pending, Shipped, Delivered)

### Customers Data

- 5 sample customers with profiles
- Order history and spending data
- Customer ratings and reviews
- Status tracking (Active, Inactive, Blocked)

### Promotions Data

- 3 sample promotional codes
- Different discount types (percentage, fixed)
- Usage limits and tracking
- Validity periods

## API Simulation Features

- **Realistic Delays**: API calls simulate network delays (500ms default)
- **Error Simulation**: 10% chance of API errors for testing error handling
- **Data Persistence**: Changes are maintained in memory during the session
- **Realistic Responses**: All API responses match the expected backend format

## File Structure

```
admin/src/
├── api/
│   ├── dummyData.js          # Main dummy data service
│   ├── axiosAdmin.js         # Updated to use dummy data
│   ├── productsAdmin.js      # Updated to use dummy data
│   └── uploadAdmin.js        # Updated to use dummy data
├── components/
│   ├── common/
│   │   ├── ProtectedRoute.js # Route protection for authenticated users
│   │   └── PublicRoute.js    # Route protection for public pages
│   └── layout/
│       └── Layout.js         # Main layout with user menu and logout
├── context/
│   └── AuthContext.js        # Authentication context with login/register/logout
├── pages/
│   ├── Login.js              # Login page with credentials display
│   ├── Register.js           # Registration page with validation
│   ├── Dashboard.js          # Dashboard with statistics and charts
│   ├── Products.js           # Product management
│   ├── Orders.js             # Order management
│   └── Promotions.js         # Promotion management
└── App.js                    # Main app with route protection
```

## Usage

1. Start the admin panel: `npm start`
2. Navigate to `/login` or `/register`
3. Use provided credentials or register a new account
4. Navigate through different sections
5. All data operations will use mock data
6. Changes are simulated but not persisted (reset on page refresh)

## Authentication Flow

1. **Unauthenticated User**: Redirected to login page
2. **Login**: Use credentials or click "Register Now" to create account
3. **Registration**: Fill form with validation, redirected to login after success
4. **Authenticated User**: Access to all admin features with user menu in header
5. **Logout**: Clears session and redirects to login page

## Benefits

- **No Backend Required**: Works completely offline
- **Realistic Testing**: Simulates real API behavior with delays and errors
- **Development Friendly**: Fast iteration without backend setup
- **Demo Ready**: Perfect for presentations and demos
- **Error Testing**: Built-in error simulation for testing edge cases
- **Route Protection**: Complete authentication flow with protected routes

## Notes

- All data is stored in memory and resets when the page is refreshed
- Image uploads are simulated and return mock URLs
- Authentication tokens are dummy JWT tokens
- The system maintains realistic data relationships and constraints
- Registration creates new user accounts in memory (not persisted)

## Future Integration

When ready to connect to a real backend:

1. Replace the dummy data imports with real API calls
2. Update the API base URLs to point to your backend
3. Implement real authentication with proper JWT handling
4. Add proper error handling for network issues
5. Implement real user registration and management

The current structure makes it easy to switch between dummy data and real APIs by simply changing the import statements.
