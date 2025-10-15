import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [draftRecipes, setDraftRecipes] = useState([]);
  const [publishedRecipes, setPublishedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const draftQuery = query(collection(db, 'recipes'), where('status', '==', 'draft'));
      const publishedQuery = query(collection(db, 'recipes'), where('status', '==', 'published'));

      const [draftSnap, publishedSnap] = await Promise.all([
        getDocs(draftQuery),
        getDocs(publishedQuery)
      ]);

      setDraftRecipes(draftSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPublishedRecipes(publishedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const publishRecipe = async (recipeId) => {
    try {
      await updateDoc(doc(db, 'recipes', recipeId), { status: 'published' });
      alert('Recipe published! ✓');
      fetchRecipes();
    } catch (error) {
      console.error('Error publishing recipe:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteDoc(doc(db, 'recipes', recipeId));
        alert('Recipe deleted');
        fetchRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  if (selectedRecipe) {
    return (
      <div className="admin-edit">
        <button onClick={() => setSelectedRecipe(null)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Back</button>
        
        <div className="recipe-card">
          <h2>{selectedRecipe.title}</h2>
          <p><strong>Status:</strong> {selectedRecipe.status}</p>
          <p><strong>Category:</strong> {selectedRecipe.category}</p>

          <h3 style={{ marginTop: '1.5rem' }}>Ingredients</h3>
          <ul>
            {selectedRecipe.ingredients?.map((ing, idx) => (
              <li key={idx}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: '1.5rem' }}>Cooking Method</h3>
          <p>{selectedRecipe.cookingMethod}</p>

          {selectedRecipe.photos && selectedRecipe.photos.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Photos ({selectedRecipe.photos.length}/5)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {selectedRecipe.photos.map((photo, idx) => (
                  <img key={idx} src={photo.url} alt={`Photo ${idx + 1}`} style={{ width: '100%', borderRadius: '4px', height: '150px', objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            {selectedRecipe.status === 'draft' && (
              <button onClick={() => publishRecipe(selectedRecipe.id)} className="btn btn-success">✓ Publish Recipe</button>
            )}
            <button onClick={() => deleteRecipe(selectedRecipe.id)} className="btn btn-danger">🗑 Delete Recipe</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📝 Drafts ({draftRecipes.length})</h3>
          {draftRecipes.length === 0 ? (
            <p style={{ color: '#999' }}>No draft recipes</p>
          ) : (
            draftRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card" onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
                <h4>{recipe.title}</h4>
                <p className="category-badge">{recipe.category}</p>
                <small style={{ color: '#999' }}>Click to review</small>
              </div>
            ))
          )}
        </div>

        <div>
          <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>✓ Published ({publishedRecipes.length})</h3>
          {publishedRecipes.length === 0 ? (
            <p style={{ color: '#999' }}>No published recipes yet</p>
          ) : (
            publishedRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card" onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
                <h4>{recipe.title}</h4>
                <p className="category-badge">{recipe.category}</p>
                <small style={{ color: '#999' }}>Click to view</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;