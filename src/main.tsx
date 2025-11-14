import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.tsx';
import Router from './router.tsx';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './auth';
import { StrictMode } from 'react';
import { Toaster } from 'sonner';
import { EventBusProvider } from './lib/EventBusProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <EventBusProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </BrowserRouter>
          <Toaster position='top-center' richColors theme='light' />
        </TooltipProvider>
      </EventBusProvider>
    </ThemeProvider>
  </StrictMode>,
);
