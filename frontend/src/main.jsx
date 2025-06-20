import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './App.css';
import AudioPlayer from './components/AudioPlayer';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AudioPlayer />
      {/* Komponen utama aplikasi */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);