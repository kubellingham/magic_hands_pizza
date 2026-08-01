import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { startOutboxFlusher } from './lib/orderOutbox'
import './index.css'

// Replays any order that failed to reach the kitchen board on a previous visit
startOutboxFlusher()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
