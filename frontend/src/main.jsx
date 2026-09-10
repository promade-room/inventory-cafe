import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tangkap kegagalan load chunk lama setelah update build
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload(true)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
