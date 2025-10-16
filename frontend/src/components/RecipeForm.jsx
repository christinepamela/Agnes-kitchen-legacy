import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import VoiceInput from './VoiceInput';
import PhotoUpload from './PhotoUpload';

const RecipeForm = ({ onRecipeSaved, editMode = false, existingRecipe = null }) => {
  const [step, setStep] = useState(1);
  const [recipe, setRecipe] = useState(existingRecipe || {
    title: '',
    category: 'chicken',
    ingredients: [{ name: '', amount: '', unit: 'tsp' }],
    cookingMethod: '',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    photos: []
  });

  const categories = ['chicken', 'fish', 'vegetables', 'beef', 'pork', 'mutton', 'desserts', 'other'];
  const units = ['tsp', 'tbsp', 'cup', 'ml', 'l', 'g', 'kg', 'piece', 'pieces', 'pods', 'inches'];

  const handleBasicChange = (field, value) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...recipe.ingredients];
    updated[index][field] = value;
    setRecipe(prev => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: 'tsp' }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUploadComplete = (photos) => {
    setRecipe(prev => ({ ...prev, photos }));
  };

  const saveRecipe = async () => {
    if (!recipe.title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    try {
      const recipeData = {
        ...recipe,
        createdAt: editMode ? recipe.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: recipe.status || 'draft'
      };

      if (editMode && existingRecipe?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'recipes', existingRecipe.id), recipeData);
        alert('Recipe updated successfully! ✓');
      } else {
        await addDoc(collection(db, 'recipes'), recipeData);
        alert('Recipe saved successfully! ✓');
      }

      if (!editMode) {
        setRecipe({
          title: '',
          category: 'chicken',
          ingredients: [{ name: '', amount: '', unit: 'tsp' }],
          cookingMethod: '',
          servings: 4,
          prepTime: 15,
          cookTime: 30,
          photos: []
        });
        setStep(1);
      }
      if (onRecipeSaved) onRecipeSaved();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Error saving recipe. Please try again.');
    }
  };

  return (
    <div className="recipe-form">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(1)}
          className={`btn ${step === 1 ? 'btn-primary' : 'btn-secondary'}`}
        >
          Step 1: Basics
        </button>
        <button
          onClick={() => setStep(2)}
          className={`btn ${step === 2 ? 'btn-primary' : 'btn-secondary'}`}
        >
          Step 2: Ingredients
        </button>
        <button
          onClick={() => setStep(3)}
          className={`btn ${step === 3 ? 'btn-primary' : 'btn-secondary'}`}
        >
          Step 3: Photos
        </button>
      </div>

      {step === 1 && (
        <div>
          <h2>Step 1: Recipe Basics</h2>
          {!editMode && <VoiceInput onTranscriptComplete={(text) => handleBasicChange('title', text)} />}

          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              value={recipe.title}
              onChange={(e) => handleBasicChange('title', e.target.value)}
              placeholder="e.g., Rendang Ayam"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={recipe.category} onChange={(e) => handleBasicChange('category', e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Servings</label>
              <input type="number" value={recipe.servings} onChange={(e) => handleBasicChange('servings', parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Prep Time (minutes)</label>
              <input type="number" value={recipe.prepTime} onChange={(e) => handleBasicChange('prepTime', parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Cook Time (minutes)</label>
              <input type="number" value={recipe.cookTime} onChange={(e) => handleBasicChange('cookTime', parseInt(e.target.value))} />
            </div>
          </div>

          <button onClick={() => setStep(2)} className="btn btn-primary">Continue to Ingredients →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Ingredients & Method</h2>

          <div className="form-group">
            <label>Ingredients</label>
            {recipe.ingredients.map((ing, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                />
                <select value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}>
                  {units.map(u => (<option key={u} value={u}>{u}</option>))}
                </select>
                <button onClick={() => removeIngredient(index)} className="btn btn-danger" style={{ padding: '0.5rem 0.75rem' }}>✕</button>
              </div>
            ))}
            <button onClick={addIngredient} className="btn btn-secondary" style={{ marginTop: '1rem' }}>+ Add Ingredient</button>
          </div>

          <div className="form-group">
            <label>Cooking Method</label>
            <textarea
              value={recipe.cookingMethod}
              onChange={(e) => handleBasicChange('cookingMethod', e.target.value)}
              placeholder="Describe the cooking steps..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">← Back to Basics</button>
            <button onClick={() => setStep(3)} className="btn btn-primary">Continue to Photos →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Add Photos</h2>
          <PhotoUpload recipeId={recipe.title || existingRecipe?.id} onPhotoUploadComplete={handlePhotoUploadComplete} existingPhotos={recipe.photos} />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">← Back to Ingredients</button>
            <button onClick={saveRecipe} className="btn btn-success">✓ {editMode ? 'Update Recipe' : 'Save Recipe'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeForm;