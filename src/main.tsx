import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { FinancialDataProvider } from './context/FinancialDataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FinancialDataProvider>
      <App />
    </FinancialDataProvider>
  </StrictMode>,
);
