import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ElectoralDataProvider } from './context/ElectoralDataContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Falha no Sistema SEIE">
      <AuthProvider>
        <ElectoralDataProvider>
          <ErrorBoundary fallbackTitle="Falha no Módulo Principal do SEIE">
            <App />
          </ErrorBoundary>
        </ElectoralDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

