// Mock product data for different categories
const mockProducts = {
  fashion: [
    {
      id: '2',
      brand: "ARMEDANGELS",
      title: "Sustainable Fashion Collection",
      description: "Premium eco-friendly clothing for conscious consumers",
      image: "/images/armedangels.jpg",
      logo: "/images/logos/armedangels.png",
      discount: "Up to 20% off"
    },
    {
      id: '3',
      brand: "BOSS",
      title: "Premium Collection",
      description: "Luxury fashion at student prices",
      image: "/images/boss.jpg",
      logo: "/images/logos/boss.png",
      discount: "25% Student Discount"
    },
    {
      id: '4',
      brand: "MISSOMA",
      title: "Jewelry Collection",
      description: "Handcrafted jewelry pieces with student discount",
      image: "/images/missoma.jpg",
      logo: "/images/logos/missoma.png",
      discount: "15% off + Free Shipping"
    },
    {
      id: '5',
      brand: "SmartBuyGlasses",
      title: "Designer Eyewear",
      description: "Premium sunglasses and prescription glasses",
      image: "/images/smartbuyglasses.jpg",
      logo: "/images/logos/smartbuyglasses.png",
      discount: "20% student discount"
    }
  ],
  technology: [
    {
      id: '1',
      brand: "Samsung",
      title: "Samsung Galaxy S25 Pre-order",
      description: "Get the latest Samsung Galaxy S25 with student discount",
      image: "/images/carousel/samsung-s25.jpg",
      logo: "/images/logos/samsung.png",
      discount: "£150 off + Free Galaxy Buds"
    },
    {
      id: '6',
      brand: "Apple",
      title: "Apple Education Pricing",
      description: "Save with Apple Education Pricing on Mac and iPad",
      image: "/images/categories/apple.jpg",
      logo: "/images/logos/apple.png",
      discount: "Up to £150 off + Free AirPods"
    },
    {
      id: '7',
      brand: "MediaMarkt",
      title: "MediaMarkt Student Savings",
      description: "Save 10€ on every order of 100€ or more",
      image: "/images/categories/mediamarkt.jpg",
      logo: "/images/logos/mediamarkt.png",
      discount: "10€ off orders over 100€"
    },
    {
      id: '8',
      brand: "Amazon Prime",
      title: "Prime Student Membership",
      description: "Prime Student Membership 6 months free for you",
      image: "/images/categories/amazon-prime.jpg",
      logo: "/images/logos/amazon.png",
      discount: "6 months free + 50% off thereafter"
    },
    {
      id: '9',
      brand: "Disney+",
      title: "Disney+ Annual Subscription",
      description: "Save over 15% with an annual subscription",
      image: "/images/categories/disney.jpg",
      logo: "/images/logos/disney.png",
      discount: "15% off annual subscription"
    }
  ]
};

// Function to simulate API call delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get products by category with pagination
export const getProductsByCategory = async (category, page = 1, limit = 10) => {
  await delay(800); // Simulate network delay
  
  const products = mockProducts[category.toLowerCase()] || [];
  const start = (page - 1) * limit;
  const end = start + limit;
  const slicedProducts = products.slice(start, end);
  
  return {
    products: slicedProducts,
    hasMore: end < products.length
  };
};

export default {
  getProductsByCategory
};
