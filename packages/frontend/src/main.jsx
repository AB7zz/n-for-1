import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { MainProvider } from './context/MainContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MainProvider>
        <App />
      </MainProvider>
    </AuthProvider>
  </React.StrictMode>,
)
