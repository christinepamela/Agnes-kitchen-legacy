import React, { useState } from 'react';
import RecipeGallery from '../components/RecipeGallery';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = ['chicken', 'fish', 'vegetables', 'beef', 'pork', 'mutton', 'desserts', 'other'];

  return (
    <div className="gallery-page">
      <h2>Recipe Gallery</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Recipes
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <RecipeGallery category={selectedCategory} />
    </div>
  );
};

export default Gallery;