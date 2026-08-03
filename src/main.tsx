import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App' // On ajoute ../ pour remonter d'un dossier vers la racine

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
