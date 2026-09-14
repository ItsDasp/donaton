import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './lib/msalConfig'
import { useAuthStore } from './store/authStore'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

msalInstance.initialize().then(async () => {
  await msalInstance.handleRedirectPromise()
  
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length > 0) {
    await useAuthStore.getState().checkAuth()
  } else {
    useAuthStore.getState().logout(false)
    localStorage.removeItem('donaton-auth')
  }
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  )
})
