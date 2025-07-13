# Mock Data Documentation

This directory contains comprehensive mock data for the BEATEN frontend development. All data is structured to mimic real API responses and can be used for development and testing.

## File Structure

- `mockData.js` - Main mock data file containing all data structures
- `README.md` - This documentation file

## Data Categories

### 1. User Data (`mockUsers`)
```javascript
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  isPremium: true,
  premiumExpiry: "2024-12-31",
  avatar: "https://i.pravatar.cc/150?img=1",
  addresses: [...]
}
```

### 2. Product Categories (`categories`)
Organized by gender with subcategories:
```javascript
{
  MEN: {
    "T-shirts": ["Regular", "Oversized", "Graphic T-shirts", "Embroidery"],
    "Shirts": ["Casual wear", "Formal wear", "Designer"],
    // ... more categories
  },
  WOMEN: {
    // ... women's categories
  }
}
```

### 3. Collections (`collections`)
List of available collections:
- Beaten Exclusive Collection
- Beaten Launch Sale Vol 1
- Beaten Signature Collection
- New Arrivals
- Best Sellers
- Summer Collection
- Winter Collection

### 4. Products (`mockProducts`)
Comprehensive product data with:
- Basic info (name, price, images)
- Category and subcategory
- Sizes, colors, fit options
- Detailed descriptions and features
- Specifications
- Ratings and reviews count
- Tags for search functionality

### 5. Shop by Category (`shopByCategory`)
Category cards with:
- Category name
- Image
- Product count
- Navigation link

### 6. Coupons (`mockCoupons`)
Coupon data with:
- Code
- Discount amount
- Category (public/premium)
- Minimum order amount
- Maximum discount limit

### 7. Orders (`mockOrders`)
Sample order data with:
- Order details
- Items
- Shipping information
- Payment status

### 8. Reviews (`mockReviews`)
Product reviews with:
- User information
- Rating
- Comments
- Dates

### 9. Hero Slides (`heroSlides`, `mobileHeroSlides`)
Carousel data for homepage with:
- Images
- Titles and descriptions
- Mobile-specific versions

### 10. Collections Data (`collectionsData`)
Collection showcase data with:
- Title and description
- Images
- Navigation links

### 11. Features (`features`)
Website features with:
- Icons
- Titles
- Descriptions

## Helper Functions

### Product Functions
- `getProductsByCategory(category)` - Get products by category
- `getProductsByCollection(collection)` - Get products by collection
- `getProductById(id)` - Get specific product by ID
- `getProductsByGender(gender)` - Get products by gender
- `searchProducts(query)` - Search products by name, description, or tags

### Coupon Functions
- `validateCoupon(code, orderTotal)` - Validate coupon with order total

## Usage Examples

### Importing Data
```javascript
import { 
  mockProducts, 
  getProductById, 
  searchProducts,
  validateCoupon 
} from '../data/mockData';
```

### Getting Products
```javascript
// Get all products
const allProducts = mockProducts;

// Get product by ID
const product = getProductById('t1');

// Search products
const searchResults = searchProducts('premium');

// Get products by category
const tshirts = getProductsByCategory('T-shirts');
```

### Using Coupons
```javascript
const couponValidation = validateCoupon('WELCOME10', 1500);
if (couponValidation.valid) {
  console.log('Discount:', couponValidation.discountAmount);
}
```

## Data Structure Details

### Product Structure
```javascript
{
  _id: 't1',
  name: 'Premium Street T-Shirt',
  price: 1299,
  originalPrice: 1599,
  image: '/images/1.png',
  images: ['/images/1.png', '/images/2.png', '/images/3.png', '/images/4.png'],
  category: 'T-shirts',
  subCategory: 'Regular',
  collection: 'Beaten Exclusive Collection',
  gender: 'MEN',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black', 'White', 'Navy'],
  fit: 'Regular',
  description: 'Detailed product description...',
  features: ['Feature 1', 'Feature 2'],
  specifications: {
    'Material': '100% Cotton',
    'Fit': 'Regular',
    'Care': 'Machine wash cold',
    'Origin': 'India'
  },
  inStock: true,
  rating: 4.5,
  reviews: 128,
  tags: ['premium', 'streetwear', 'urban']
}
```

### Address Structure
```javascript
{
  _id: '1',
  label: 'Home',
  fullName: 'John Doe',
  phone: '9876543210',
  addressLine1: '123 Main Street',
  addressLine2: 'Apartment 4B',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  country: 'India',
  isDefault: true
}
```

### Order Structure
```javascript
{
  _id: 'order1',
  orderNumber: 'BEATEN001',
  items: [
    {
      product: productObject,
      quantity: 2,
      size: 'M',
      color: 'Black',
      price: 1299
    }
  ],
  total: 2598,
  status: 'Delivered',
  orderDate: '2024-01-15',
  deliveryDate: '2024-01-18',
  shippingAddress: addressObject,
  paymentMethod: 'Razorpay',
  paymentStatus: 'Paid'
}
```

## Development Notes

1. **Image Paths**: All image paths are relative to the public directory
2. **Pricing**: All prices are in Indian Rupees (INR)
3. **IDs**: Product IDs use descriptive prefixes (t1, s1, bw1, etc.)
4. **Realistic Data**: All data is structured to be realistic and comprehensive
5. **Extensible**: Easy to add more products, categories, or data types

## Adding New Data

To add new products or data:

1. Add to the appropriate array in `mockData.js`
2. Follow the existing structure
3. Update helper functions if needed
4. Test the integration in components

## Testing

The mock data can be used for:
- Component development
- UI testing
- Feature development
- Performance testing
- User experience testing

All data is designed to work seamlessly with the existing frontend components. 