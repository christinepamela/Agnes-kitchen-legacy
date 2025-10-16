import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import RecipeForm from '../components/RecipeForm';

const AdminDashboard = () => {
  const [draftRecipes, setDraftRecipes] = useState([]);
  const [publishedRecipes, setPublishedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [addingPhotos, setAddingPhotos] = useState(false);

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
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error publishing recipe:', error);
    }
  };

  const unpublishRecipe = async (recipeId) => {
    if (window.confirm('Unpublish this recipe? It will move back to drafts.')) {
      try {
        await updateDoc(doc(db, 'recipes', recipeId), { status: 'draft' });
        alert('Recipe unpublished');
        fetchRecipes();
        setSelectedRecipe(null);
      } catch (error) {
        console.error('Error unpublishing recipe:', error);
      }
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'recipes', recipeId));
        alert('Recipe deleted');
        fetchRecipes();
        setSelectedRecipe(null);
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    const currentPhotos = selectedRecipe.photos || [];
    
    if (currentPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed per recipe');
      return;
    }

    try {
      const newPhotos = [];
      for (let file of files) {
        const storageRef = ref(storage, `recipes/${selectedRecipe.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        newPhotos.push({ id: Date.now() + Math.random(), url, name: file.name });
      }

      const updatedPhotos = [...currentPhotos, ...newPhotos];
      await updateDoc(doc(db, 'recipes', selectedRecipe.id), { photos: updatedPhotos });
      
      alert('Photos added successfully! ✓');
      setAddingPhotos(false);
      fetchRecipes();
      
      // Update the selected recipe view
      setSelectedRecipe({ ...selectedRecipe, photos: updatedPhotos });
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos');
    }
  };

  const deletePhoto = async (photoToDelete) => {
    if (window.confirm('Delete this photo?')) {
      try {
        const updatedPhotos = selectedRecipe.photos.filter(p => p.id !== photoToDelete.id);
        await updateDoc(doc(db, 'recipes', selectedRecipe.id), { photos: updatedPhotos });
        
        alert('Photo deleted');
        setSelectedRecipe({ ...selectedRecipe, photos: updatedPhotos });
        fetchRecipes();
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
  };

  if (editMode && selectedRecipe) {
    return (
      <div className="admin-edit">
        <button 
          onClick={() => {
            setEditMode(false);
            fetchRecipes();
          }} 
          className="btn btn-secondary" 
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Recipe View
        </button>
        <h2>Editing: {selectedRecipe.title}</h2>
        <RecipeForm 
          editMode={true} 
          existingRecipe={selectedRecipe}
          onRecipeSaved={() => {
            setEditMode(false);
            setSelectedRecipe(null);
            fetchRecipes();
          }}
        />
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="admin-edit">
        <button onClick={() => setSelectedRecipe(null)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Back to Dashboard</button>
        
        <div className="recipe-card">
          <h2>{selectedRecipe.title}</h2>
          <p><strong>Status:</strong> <span style={{ 
            color: selectedRecipe.status === 'published' ? '#10b981' : '#f59e0b',
            fontWeight: 'bold'
          }}>{selectedRecipe.status}</span></p>
          <p><strong>Category:</strong> {selectedRecipe.category}</p>
          <p><strong>Servings:</strong> {selectedRecipe.servings} | <strong>Prep:</strong> {selectedRecipe.prepTime}min | <strong>Cook:</strong> {selectedRecipe.cookTime}min</p>

          <h3 style={{ marginTop: '1.5rem' }}>Ingredients</h3>
          <ul>
            {selectedRecipe.ingredients?.map((ing, idx) => (
              <li key={idx}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: '1.5rem' }}>Cooking Method</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{selectedRecipe.cookingMethod}</p>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Photos ({selectedRecipe.photos?.length || 0}/5)</h3>
              {(!selectedRecipe.photos || selectedRecipe.photos.length < 5) && !addingPhotos && (
                <button onClick={() => setAddingPhotos(true)} className="btn btn-primary">+ Add More Photos</button>
              )}
            </div>

            {addingPhotos && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  style={{ marginBottom: '0.5rem' }}
                />
                <button onClick={() => setAddingPhotos(false)} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Cancel</button>
              </div>
            )}

            {selectedRecipe.photos && selectedRecipe.photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {selectedRecipe.photos.map((photo, idx) => (
                  <div key={photo.id || idx} style={{ position: 'relative' }}>
                    <img 
                      src={photo.url} 
                      alt={`Photo ${idx + 1}`} 
                      style={{ width: '100%', borderRadius: '4px', height: '150px', objectFit: 'cover' }} 
                    />
                    <button
                      onClick={() => deletePhoto(photo)}
                      className="btn btn-danger"
                      style={{ 
                        position: 'absolute', 
                        top: '5px', 
                        right: '5px', 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '0.8rem' 
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>No photos yet</p>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => setEditMode(true)} className="btn btn-primary">✏️ Edit Recipe</button>
            
            {selectedRecipe.status === 'draft' && (
              <button onClick={() => publishRecipe(selectedRecipe.id)} className="btn btn-success">✓ Publish Recipe</button>
            )}
            
            {selectedRecipe.status === 'published' && (
              <button onClick={() => unpublishRecipe(selectedRecipe.id)} className="btn" style={{ background: '#f59e0b', color: 'white' }}>⎌ Unpublish</button>
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
      <p style={{ color: '#666', marginBottom: '2rem' }}>Review recipes from Agnes, edit them, and publish to the gallery.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>📝 Drafts ({draftRecipes.length})</h3>
          {draftRecipes.length === 0 ? (
            <p style={{ color: '#999' }}>No draft recipes</p>
          ) : (
            draftRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card" onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
                <h4>{recipe.title}</h4>
                <span className="category-badge">{recipe.category}</span>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  {recipe.photos?.length || 0} photo(s) | {recipe.ingredients?.length || 0} ingredients
                </p>
                <small style={{ color: '#999' }}>Click to review →</small>
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
                <span className="category-badge">{recipe.category}</span>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  {recipe.photos?.length || 0} photo(s) | {recipe.ingredients?.length || 0} ingredients
                </p>
                <small style={{ color: '#999' }}>Click to view/edit →</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;