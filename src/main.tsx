import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './fonts.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { I18nProvider, initLocale } from './i18n'
import { initPwaUpdateEngine } from './utils/pwaUpdateEngine'

initLocale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </I18nProvider>
  </StrictMode>,
)

// Initialize PWA Update & Push Notification Engine
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initPwaUpdateEngine();
  });
}
