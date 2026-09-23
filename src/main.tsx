import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPwaUpdateEngine } from './utils/pwaUpdateEngine'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize PWA Update & Push Notification Engine
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initPwaUpdateEngine();
  });
}
