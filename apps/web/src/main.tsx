import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './app';
import './i18n';
import './styles.css';
import { notifyApplicationError } from './lib/error-notifier';
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notifyApplicationError }),
  mutationCache: new MutationCache({ onError: notifyApplicationError })
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
