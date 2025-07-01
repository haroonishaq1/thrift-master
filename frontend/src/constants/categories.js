// Shared categories used across the entire website
// These categories should be consistent in Header navigation, Brand registration, Brand profile editing, and Offer creation

export const CATEGORIES = [
  { name: 'Food & Drink', value: 'food' },
  { name: 'Fitness', value: 'fitness' },
  { name: 'Technology', value: 'electronics' },
  { name: 'Beauty', value: 'beauty' },
  { name: 'Fashion', value: 'fashion' },
  { name: 'Education', value: 'education' }
];

// Category options for forms (includes empty option for validation)
export const CATEGORY_OPTIONS = [
  { value: '', label: 'Select Category' },
  ...CATEGORIES.map(cat => ({ value: cat.value, label: cat.name }))
];

// Category options for brand registration (includes empty option with custom text)
export const BRAND_CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  ...CATEGORIES.map(cat => ({ value: cat.value, label: cat.name }))
];
