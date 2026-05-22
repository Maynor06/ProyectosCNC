import { useState } from 'react';
import './App.css';
import { UploadView } from './components/UploadView';
import { GalleryView } from './components/GalleryView';
import { CncView } from './components/CncView';

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'gallery' | 'cnc'>('upload');

  return (
    <div className="app-container">
      <nav className="navbar glass-nav">
        <div className="nav-brand">
          <img
            src="/cncicon.png"
            alt="CNC Logo"
            className="nav-logo"
            style={{ height: '36px', width: 'auto', borderRadius: '8px' }}
          />
          <h1>CNC Avatar Studio</h1>
        </div>
        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
            onClick={() => setCurrentView('upload')}
          >
            Crear Avatar
          </button>
          <button
            className={`nav-btn ${currentView === 'gallery' ? 'active' : ''}`}
            onClick={() => setCurrentView('gallery')}
          >
            Galería
          </button>
          <button
            className={`nav-btn ${currentView === 'cnc' ? 'active' : ''}`}
            onClick={() => setCurrentView('cnc')}
          >
            Monitor CNC
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'upload' && <UploadView />}
        {currentView === 'gallery' && <GalleryView />}
        {currentView === 'cnc' && <CncView />}
      </main>
    </div>
  );
}

export default App;
