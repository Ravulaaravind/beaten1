// Mock Data for BEATEN Frontend Development

// User Data
export const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    isPremium: true,
    premiumExpiry: "2024-12-31",
    avatar: "https://i.pravatar.cc/150?img=1",
    addresses: [
      {
        _id: "1",
        label: "Home",
        fullName: "John Doe",
        phone: "9876543210",
        addressLine1: "123 Main Street",
        addressLine2: "Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
        isDefault: true,
      },
      {
        _id: "2",
        label: "Office",
        fullName: "John Doe",
        phone: "9876543210",
        addressLine1: "456 Business Park",
        addressLine2: "Floor 3",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
        country: "India",
        isDefault: false,
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "9876543211",
    isPremium: false,
    avatar: "https://i.pravatar.cc/150?img=2",
  },
];

// Product Categories
export const categories = {
  MEN: {
    "T-shirts": ["Regular", "Oversized", "Graphic T-shirts", "Embroidery"],
    Shirts: ["Casual wear", "Formal wear", "Designer"],
    "Bottom Wear": ["Jeans", "Cargo Pants", "Chinos", "Shorts"],
    Hoodies: ["Regular", "Oversized", "Zipper", "Pullover"],
    Jackets: ["Casual", "Formal", "Bomber", "Denim"],
    "Co-ord Sets": ["Casual", "Formal", "Party"],
  },
  WOMEN: {
    "T-shirts": ["Regular", "Oversized", "Graphic T-shirts", "Crop Top"],
    Shirts: ["Casual wear", "Formal wear", "Designer"],
    Dresses: ["Casual", "Party", "Formal"],
    "Bottom Wear": ["Jeans", "Cargo Pants", "Skirts", "Shorts"],
  },
};

// Collections
export const collections = [
  "Beaten Exclusive Collection",
  "Beaten Launch Sale Vol 1",
  "Beaten Signature Collection",
  "New Arrivals",
  "Best Sellers",
  "Summer Collection",
  "Winter Collection",
];

// Mock Products Data
export const mockProducts = [
  // T-Shirts
  {
    _id: "t1",
    name: "Premium Street T-Shirt",
    price: 1299,
    originalPrice: 1599,
    image: "/images/1.png",
    images: [
      "/images/1.png",
      "/images/2.png",
      "/images/3.png",
      "/images/4.png",
    ],
    category: "T-shirts",
    subCategory: "Regular",
    collectionName: "Beaten Exclusive Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
    fit: "Regular",
    description:
      "Premium quality streetwear t-shirt crafted with exceptional materials and attention to detail. Perfect for urban style enthusiasts who demand both comfort and style.",
    features: [
      "Premium cotton blend",
      "Comfortable fit",
      "Durable construction",
      "Easy to maintain",
    ],
    specifications: {
      Material: "100% Cotton",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.5,
    reviews: 128,
    tags: ["premium", "streetwear", "urban"],
  },
  {
    _id: "t2",
    name: "Oversized Graphic T-Shirt",
    price: 1499,
    originalPrice: 1799,
    image: "/images/2.png",
    images: [
      "/images/2.png",
      "/images/3.png",
      "/images/4.png",
      "/images/5.png",
    ],
    category: "T-shirts",
    subCategory: "Oversized",
    collectionName: "Beaten Launch Sale Vol 1",
    gender: "MEN",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White"],
    fit: "Oversized",
    description:
      "Trendy oversized t-shirt with unique graphic design. Perfect for street style and casual wear.",
    features: [
      "Oversized fit",
      "Graphic design",
      "Comfortable fabric",
      "Street style",
    ],
    specifications: {
      Material: "100% Cotton",
      Fit: "Oversized",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.3,
    reviews: 95,
    tags: ["oversized", "graphic", "street"],
  },
  {
    _id: "t3",
    name: "Classic Crew Neck T-Shirt",
    price: 999,
    originalPrice: 1199,
    image: "/images/3.png",
    images: [
      "/images/3.png",
      "/images/4.png",
      "/images/5.png",
      "/images/6.png",
    ],
    category: "T-shirts",
    subCategory: "Regular",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Grey"],
    fit: "Regular",
    description:
      "Classic crew neck t-shirt with perfect fit and comfort. Essential for every wardrobe.",
    features: ["Classic design", "Perfect fit", "Comfortable", "Versatile"],
    specifications: {
      Material: "100% Cotton",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.7,
    reviews: 156,
    tags: ["classic", "crew", "essential"],
  },

  // Shirts
  {
    _id: "s1",
    name: "Casual Linen Shirt",
    price: 1899,
    originalPrice: 2299,
    image: "/images/4.png",
    images: [
      "/images/4.png",
      "/images/5.png",
      "/images/6.png",
      "/images/7.png",
    ],
    category: "Shirts",
    subCategory: "Casual wear",
    collectionName: "Beaten Exclusive Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Pink"],
    fit: "Regular",
    description:
      "Comfortable linen shirt perfect for casual occasions. Breathable fabric keeps you cool.",
    features: ["Linen fabric", "Breathable", "Casual style", "Comfortable fit"],
    specifications: {
      Material: "100% Linen",
      Fit: "Regular",
      Care: "Dry clean recommended",
      Origin: "India",
    },
    inStock: true,
    rating: 4.4,
    reviews: 89,
    tags: ["linen", "casual", "breathable"],
  },
  {
    _id: "s2",
    name: "Formal Cotton Shirt",
    price: 2199,
    originalPrice: 2599,
    image: "/images/5.png",
    images: [
      "/images/5.png",
      "/images/6.png",
      "/images/7.png",
      "/images/8.png",
    ],
    category: "Shirts",
    subCategory: "Formal wear",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue", "Pink"],
    fit: "Regular",
    description:
      "Professional formal shirt suitable for office and business meetings.",
    features: [
      "Formal design",
      "Professional look",
      "Comfortable fit",
      "Easy iron",
    ],
    specifications: {
      Material: "100% Cotton",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.6,
    reviews: 112,
    tags: ["formal", "professional", "office"],
  },

  // Bottom Wear
  {
    _id: "bw1",
    name: "Urban Cargo Pants",
    price: 2499,
    originalPrice: 2999,
    image: "/images/cargo-pants.png",
    images: [
      "/images/cargo-pants.png",
      "/images/bottom-wear.png",
      "/images/co-ord-sets.png",
    ],
    category: "Bottom Wear",
    subCategory: "Cargo Pants",
    collectionName: "Beaten Launch Sale Vol 1",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Olive", "Khaki"],
    fit: "Regular",
    description:
      "Comfortable urban cargo pants with multiple pockets. Perfect for street style.",
    features: [
      "Multiple pockets",
      "Comfortable fit",
      "Durable fabric",
      "Street style",
    ],
    specifications: {
      Material: "Cotton Blend",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.5,
    reviews: 134,
    tags: ["cargo", "urban", "pockets"],
  },
  {
    _id: "bw2",
    name: "Slim Fit Jeans",
    price: 1899,
    originalPrice: 2299,
    image: "/images/bottom-wear.png",
    images: [
      "/images/bottom-wear.png",
      "/images/cargo-pants.png",
      "/images/co-ord-sets.png",
    ],
    category: "Bottom Wear",
    subCategory: "Jeans",
    collectionName: "Beaten Exclusive Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black", "Grey"],
    fit: "Slim",
    description:
      "Modern slim fit jeans with stretch comfort. Perfect for casual and semi-formal occasions.",
    features: ["Slim fit", "Stretch comfort", "Modern design", "Versatile"],
    specifications: {
      Material: "Denim with Stretch",
      Fit: "Slim",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.3,
    reviews: 98,
    tags: ["jeans", "slim", "stretch"],
  },

  // Hoodies
  {
    _id: "h1",
    name: "Signature Hoodie",
    price: 1899,
    originalPrice: 2299,
    image: "/images/hoodies.png",
    images: [
      "/images/hoodies.png",
      "/images/jackets.png",
      "/images/shirts.png",
    ],
    category: "Hoodies",
    subCategory: "Regular",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Navy"],
    fit: "Regular",
    description:
      "Signature collection hoodie with premium quality and comfort.",
    features: [
      "Premium fabric",
      "Comfortable fit",
      "Signature design",
      "Warm and cozy",
    ],
    specifications: {
      Material: "Cotton Blend",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.7,
    reviews: 167,
    tags: ["hoodie", "signature", "premium"],
  },
  {
    _id: "h2",
    name: "Oversized Zipper Hoodie",
    price: 2199,
    originalPrice: 2599,
    image: "/images/jackets.png",
    images: [
      "/images/jackets.png",
      "/images/hoodies.png",
      "/images/oversized-tshirts.png",
    ],
    category: "Hoodies",
    subCategory: "Zipper",
    collectionName: "Beaten Launch Sale Vol 1",
    gender: "MEN",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Grey"],
    fit: "Oversized",
    description: "Trendy oversized zipper hoodie perfect for street style.",
    features: ["Oversized fit", "Zipper design", "Street style", "Comfortable"],
    specifications: {
      Material: "Cotton Blend",
      Fit: "Oversized",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.4,
    reviews: 76,
    tags: ["oversized", "zipper", "street"],
  },

  // Jackets
  {
    _id: "j1",
    name: "Casual Bomber Jacket",
    price: 3499,
    originalPrice: 3999,
    image: "/images/shirts.png",
    images: [
      "/images/shirts.png",
      "/images/hoodies.png",
      "/images/jackets.png",
    ],
    category: "Jackets",
    subCategory: "Casual",
    collectionName: "Beaten Exclusive Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    fit: "Regular",
    description:
      "Classic bomber jacket with modern styling. Perfect for casual and street wear.",
    features: [
      "Bomber style",
      "Comfortable fit",
      "Durable fabric",
      "Versatile design",
    ],
    specifications: {
      Material: "Polyester Blend",
      Fit: "Regular",
      Care: "Dry clean recommended",
      Origin: "India",
    },
    inStock: true,
    rating: 4.6,
    reviews: 89,
    tags: ["bomber", "casual", "jacket"],
  },

  // Co-ord Sets
  {
    _id: "cs1",
    name: "Urban Co-Ord Set",
    price: 3999,
    originalPrice: 4499,
    image: "/images/co-ord-sets.png",
    images: [
      "/images/co-ord-sets.png",
      "/images/shirts.png",
      "/images/hoodies.png",
    ],
    category: "Co-ord Sets",
    subCategory: "Casual",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    fit: "Regular",
    description:
      "Complete co-ord set with matching top and bottom. Perfect for coordinated looks.",
    features: [
      "Matching set",
      "Coordinated look",
      "Comfortable fit",
      "Versatile pieces",
    ],
    specifications: {
      Material: "Cotton Blend",
      Fit: "Regular",
      Care: "Machine wash cold",
      Origin: "India",
    },
    inStock: true,
    rating: 4.8,
    reviews: 45,
    tags: ["co-ord", "matching", "set"],
  },
];

// Best Sellers
export const bestSellers = mockProducts.filter((product) =>
  ["t1", "bw1", "h1"].includes(product._id)
);

// Shop By Category Data
export const shopByCategory = [
  {
    name: "T-Shirts",
    image: "/images/oversized-tshirts.png",
    count: 24,
    link: "/products?category=T-shirts",
  },
  {
    name: "Shirts",
    image: "/images/shirts.png",
    count: 18,
    link: "/products?category=Shirts",
  },
  {
    name: "Hoodies",
    image: "/images/hoodies.png",
    count: 12,
    link: "/products?category=Hoodies",
  },
  {
    name: "Jackets",
    image: "/images/jackets.png",
    count: 8,
    link: "/products?category=Jackets",
  },
  {
    name: "Bottom Wear",
    image: "/images/bottom-wear.png",
    count: 15,
    link: "/products?category=Bottom Wear",
  },
  {
    name: "Co-ord Sets",
    image: "/images/co-ord-sets.png",
    count: 6,
    link: "/products?category=Co-ord Sets",
  },
];

// Coupons Data
export const mockCoupons = [
  {
    code: "WELCOME10",
    discountAmount: 100,
    category: "public",
    isPersonal: false,
    description: "Get 10% off on your first order",
    minOrderAmount: 500,
    maxDiscount: 100,
  },
  {
    code: "SAVE20",
    discountAmount: 200,
    category: "public",
    isPersonal: false,
    description: "Save ₹200 on orders above ₹1000",
    minOrderAmount: 1000,
    maxDiscount: 200,
  },
  {
    code: "PREMIUM50",
    discountAmount: 500,
    category: "premium",
    isPersonal: true,
    description: "Premium member exclusive - 50% off up to ₹500",
    minOrderAmount: 2000,
    maxDiscount: 500,
  },
];

// Orders Data
export const mockOrders = [
  {
    _id: "order1",
    orderNumber: "BEATEN001",
    items: [
      {
        product: mockProducts[0],
        quantity: 2,
        size: "M",
        color: "Black",
        price: 1299,
      },
    ],
    total: 2598,
    status: "Delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    shippingAddress: mockUsers[0].addresses[0],
    paymentMethod: "Razorpay",
    paymentStatus: "Paid",
  },
  {
    _id: "order2",
    orderNumber: "BEATEN002",
    items: [
      {
        product: mockProducts[1],
        quantity: 1,
        size: "L",
        color: "White",
        price: 1499,
      },
      {
        product: mockProducts[2],
        quantity: 1,
        size: "M",
        color: "Black",
        price: 999,
      },
    ],
    total: 2498,
    status: "Processing",
    orderDate: "2024-01-20",
    deliveryDate: null,
    shippingAddress: mockUsers[0].addresses[1],
    paymentMethod: "COD",
    paymentStatus: "Pending",
  },
];

// Reviews Data
export const mockReviews = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    rating: 5,
    date: "2024-03-15",
    comment:
      "Excellent quality and perfect fit. The material is premium and the stitching is impeccable. Highly recommended!",
    productId: "t1",
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    rating: 4,
    date: "2024-03-10",
    comment:
      "Great product, very comfortable. The only reason for 4 stars is that the color is slightly different from the picture.",
    productId: "t1",
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    rating: 5,
    date: "2024-03-05",
    comment:
      "Absolutely love this product! The quality is outstanding and it exceeded my expectations.",
    productId: "t1",
  },
];

// Hero Slides Data
export const heroSlides = [
  {
    image: "/images/hero1Desktop.png",
    title: "PREMIUM STREET",
    subtitle: "ELEVATE YOUR STYLE",
    description:
      "Discover our premium collection crafted with exceptional materials and attention to detail.",
  },
  {
    image: "/Beaten/2.png",
    title: "LIMITED EDITION",
    subtitle: "EXCLUSIVE DROPS",
    description:
      "Be the first to get your hands on our limited edition pieces. Join the premium club for early access.",
  },
  {
    image: "/Beaten/1.png",
    title: "SIGNATURE COLLECTION",
    subtitle: "ICONIC DESIGNS",
    description:
      "Our most iconic designs, reimagined for the modern streetwear enthusiast.",
  },
  {
    image: "/Beaten/4.png",
  },
  {
    image: "/Beaten/5.png",
  },
  {
    image: "/Beaten/6.png",
  },
  {
    image: "/Beaten/7.png",
  },
  {
    image: "/Beaten/8.png",
  },
  {
    image: "/Beaten/9.png",
  },
];

// Mobile Hero Slides
export const mobileHeroSlides = [
  { image: "/mobile-version-images/1.jpg" },
  { image: "/mobile-version-images/2.jpg" },
  { image: "/mobile-version-images/3.jpg" },
  { image: "/mobile-version-images/4.jpg" },
  { image: "/mobile-version-images/5.jpg" },
  { image: "/mobile-version-images/6.jpg" },
  { image: "/mobile-version-images/7.jpg" },
  { image: "/mobile-version-images/8.jpg" },
  { image: "/mobile-version-images/9.jpg" },
];

// Collections Data
export const collectionsData = [
  {
    title: "Urban Essentials",
    description:
      "Core streetwear pieces that define urban style. Essential for every wardrobe.",
    image: "/images/category1Desktop.png",
    link: "/collections/urban-essentials",
  },
  {
    title: "Premium Street",
    description:
      "Elevated streetwear with premium materials and exceptional craftsmanship.",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/collections/premium-street",
  },
  {
    title: "Limited Edition",
    description:
      "Exclusive drops with unique designs. Limited quantities, maximum impact.",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/collections/limited-edition",
  },
  {
    title: "Signature Series",
    description:
      "Our most iconic designs, reimagined for the modern streetwear enthusiast.",
    image:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/collections/signature",
  },
];

// Features Data
export const features = [
  {
    icon: "🚚",
    title: "Express Shipping",
    description: "Free express shipping on all orders over ₹1000",
  },
  {
    icon: "🔒",
    title: "Secure Shopping",
    description: "100% secure payment processing",
  },
  {
    icon: "📞",
    title: "24/7 Support",
    description: "Dedicated customer service team",
  },
  {
    icon: "⭐",
    title: "Premium Quality",
    description: "Crafted with premium materials",
  },
];

// Helper Functions
export const getProductsByCategory = (category) => {
  return mockProducts.filter((product) => product.category === category);
};

export const getProductsByCollection = (collectionName) => {
  return mockProducts.filter(
    (product) => product.collectionName === collectionName
  );
};

export const getProductById = (id) => {
  return mockProducts.find((product) => product._id === id);
};

export const getProductsByGender = (gender) => {
  return mockProducts.filter((product) => product.gender === gender);
};

export const searchProducts = (query) => {
  const searchTerm = query.toLowerCase();
  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
};

export const validateCoupon = (code, orderTotal = 0) => {
  const coupon = mockCoupons.find((c) => c.code === code);
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  if (orderTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
    };
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.min(coupon.discountAmount, coupon.maxDiscount),
  };
};
