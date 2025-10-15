import React, { useState } from 'react';
import './App.css';
import MomInput from './pages/MomInput';
import AdminDashboard from './pages/AdminDashboard';
import Gallery from './pages/Gallery';

function App() {
  const [currentPage, setCurrentPage] = useState('gallery'); // 'gallery', 'mom', 'admin'
  const [recipes, setRecipes] = useState([]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍳 Agnes Kitchen Legacy</h1>
        <nav className="nav-buttons">
          <button 
            onClick={() => setCurrentPage('gallery')}
            className={currentPage === 'gallery' ? 'active' : ''}
          >
            Gallery
          </button>
          <button 
            onClick={() => setCurrentPage('mom')}
            className={currentPage === 'mom' ? 'active' : ''}
          >
            Add Recipe (Mom)
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className={currentPage === 'admin' ? 'active' : ''}
          >
            Admin
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentPage === 'gallery' && <Gallery recipes={recipes} />}
        {currentPage === 'mom' && <MomInput onRecipeAdded={() => setCurrentPage('gallery')} />}
        {currentPage === 'admin' && <AdminDashboard recipes={recipes} setRecipes={setRecipes} />}
      </main>
    </div>
  );
}

export default App;