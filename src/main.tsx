import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Register service worker for PWA (production only — caching dev module
// URLs breaks HMR and hijacks navigations under the dev server)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.warn('ServiceWorker registration successful:', registration.scope)
      },
      (error: unknown) => {
        console.error('ServiceWorker registration failed:', error)
      },
    )
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root is missing from the document')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
