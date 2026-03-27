import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <App />
        <Toaster position="top-right" />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
