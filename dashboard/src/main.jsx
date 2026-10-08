import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { applyBrandTheme } from './lib/theme'
import './index.css'

// Aplica a cor da marca imediatamente (evita flash ao recarregar)
try {
  const cached = JSON.parse(localStorage.getItem('contaux-settings') || '{}')
  if (cached.primary_color) applyBrandTheme(cached.primary_color)
} catch { /* usa defaults do CSS */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
