import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logo from './assets/square_logo.png';

const link = document.querySelector("link[rel~='icon']");
if (link) {
    link.href = logo;
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
