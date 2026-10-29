import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ScreenRecovery, { BrowserStorageNotice } from './components/ScreenRecovery.jsx'
import './index.css' // <--- ESSA LINHA É QUE FAZ O DESIGN FUNCIONAR!
import './components/WorkspaceDesign.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserStorageNotice />
    <ScreenRecovery>
      <App />
    </ScreenRecovery>
  </React.StrictMode>,
)
