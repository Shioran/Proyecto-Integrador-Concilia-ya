import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './states/AuthContext.jsx';
import App from './App.jsx';
import './styles.css';

// Orden de los "envoltorios": Router → AuthProvider → App.
// AuthProvider va DENTRO del Router y FUERA de App para que toda la app lea la sesión con useAuth().
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
