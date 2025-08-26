import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth.tsx';
import Router from './router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Router />   {/* Router 內部會掛 SidebarLayout */}
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
