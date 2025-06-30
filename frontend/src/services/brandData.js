// Mock brand data
export const brandData = {
  adidas: {
    name: 'adidas',
    logo: '/images/logos/adidas.png',
    discount: '25% discount',
    type: 'On-Line',
    promoImage: '/images/brands/adidas-promo.jpg',
    terms: [
      'Valid student ID required',
      'Discount applies to full-price items only',
      'Cannot be combined with other offers',
      'Online exclusive offer',
      'Valid until December 31, 2025'
    ]
  },
  nike: {
    name: 'Nike',
    logo: '/images/logos/nike.png',
    discount: '20% discount',
    type: 'On-Line',
    promoImage: '/images/brands/nike-promo.jpg',
    terms: [
      'Valid student ID required',
      'Excludes sale items',
      'One-time use per customer',
      'Online exclusive offer'
    ]
  },
  samsung: {
    name: 'Samsung',
    logo: '/images/logos/samsung.png',
    discount: '15% discount',
    type: 'On-Line & In-Store',
    promoImage: '/images/carousel/samsung.jpg',
    terms: [
      'Valid on selected products only',
      'Must verify student status',
      'Available at participating stores',
      'Cannot be combined with other promotions'
    ]
  },
  // Add more brands as needed
};

// Function to get brand data
export const getBrandData = (brandName) => {
  const brand = brandData[brandName.toLowerCase()];
  if (!brand) {
    throw new Error('Brand not found');
  }
  return brand;
};
