import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './fonts.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { initPwaUpdateEngine } from './utils/pwaUpdateEngine'

import { LanguageProvider } from './context/LanguageContext'
import { FontSizeProvider } from './context/FontSizeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <LanguageProvider>
        <FontSizeProvider>
          <App />
        </FontSizeProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  </StrictMode>,
)

// Initialize PWA Update & Push Notification Engine & run one-time migrations
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('testament_daily_checkin')) {
      localStorage.removeItem('testament_daily_checkin');
    }
  } catch {
    // ignore
  }

  window.addEventListener('load', () => {
    initPwaUpdateEngine();
  });
}
