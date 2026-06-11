import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyDesignTokens } from './config/theme';
import './styles/index.css';

// Apply accent / fonts / motion tokens before first paint (avoids a flash).
applyDesignTokens();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
