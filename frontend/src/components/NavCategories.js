import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavCategories.css';

function NavCategories() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Food & Drink', value: 'food', icon: '🍕' },
    { name: 'Fitness', value: 'fitness', icon: '💪' },
    { name: 'Electronics & Technology', value: 'electronics', icon: '📱' },
    { name: 'Beauty', value: 'beauty', icon: '💄' },
    { name: 'Fashion', value: 'fashion', icon: '👕' },
    { name: 'Education', value: 'education', icon: '📚' }
  ];

  const handleCategoryClick = (categoryValue) => {
    navigate(`/offers?category=${categoryValue}`);
  };

  return (
    <div className="nav-categories">
      <div className="nav-categories-container">
        {categories.map((category, index) => (
          <button
            key={index}
            className="category-nav-item"
            onClick={() => handleCategoryClick(category.value)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NavCategories;
