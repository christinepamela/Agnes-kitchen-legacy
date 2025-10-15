import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const RecipeGallery = ({ category }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = category
          ? query(collection(db, 'recipes'), where('category', '==', category), where('status', '==', 'published'))
          : query(collection(db, 'recipes'), where('status', '==', 'published'));
        
        const snapshot = await getDocs(q);
        setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, [category]);

  if (selectedRecipe) {
    return (
      <div className="recipe-detail">
        <button onClick={() => setSelectedRecipe(null)} className="btn btn-secondary">← Back to Gallery</button>
        <h2>{selectedRecipe.title}</h2>
        <span className="category-badge">{selectedRecipe.category}</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            {selectedRecipe.photos && selectedRecipe.photos.length > 0 && (
              <div>
                <img src={selectedRecipe.photos[0].url} alt={selectedRecipe.title} style={{ width: '100%', borderRadius: '8px' }} />
              </div>
            )}
          </div>
          <div>
            <h3>Details</h3>
            <p><strong>Servings:</strong> {selectedRecipe.servings}</p>
            <p><strong>Prep Time:</strong> {selectedRecipe.prepTime} minutes</p>
            <p><strong>Cook Time:</strong> {selectedRecipe.cookTime} minutes</p>

            <h3 style={{ marginTop: '1.5rem' }}>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing.amount} {ing.unit} {ing.name}</li>
              ))}
            </ul>

            <h3 style={{ marginTop: '1.5rem' }}>Cooking Method</h3>
            <p>{selectedRecipe.cookingMethod}</p>
          </div>
        </div>

        {selectedRecipe.photos && selectedRecipe.photos.length > 1 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>More Photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {selectedRecipe.photos.slice(1).map((photo, idx) => (
                <img key={idx} src={photo.url} alt={`${selectedRecipe.title} ${idx + 2}`} style={{ width: '100%', borderRadius: '8px', height: '200px', objectFit: 'cover' }} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Recipe Gallery</h2>
      {recipes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No recipes yet. Check back soon!</p>
      ) : (
        <div className="gallery-grid">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="recipe-thumbnail"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {recipe.photos && recipe.photos.length > 0 ? (
                <img src={recipe.photos[0].url} alt={recipe.title} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No photo
                </div>
              )}
              <div className="recipe-thumbnail-info">
                <h4>{recipe.title}</h4>
                <span className="category-badge">{recipe.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGallery;