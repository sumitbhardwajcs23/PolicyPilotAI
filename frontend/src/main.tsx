import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <App />
        <Toaster position="top-right" />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
)
