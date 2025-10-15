import React from 'react';
import RecipeForm from '../components/RecipeForm';

const MomInput = ({ onRecipeAdded }) => {
  return (
    <div className="mom-input-page">
      <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '4px', marginBottom: '2rem', border: '2px solid #ffc107' }}>
        <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}>👋 Welcome, Agnes!</h3>
        <p style={{ color: '#856404' }}>Add your recipes step by step. Take your time—Pam will help edit them later.</p>
      </div>
      <RecipeForm onRecipeSaved={onRecipeAdded} />
    </div>
  );
};

export default MomInput;