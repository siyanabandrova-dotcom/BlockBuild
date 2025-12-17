import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';

// Ignore ResizeObserver loop warnings in development
window.addEventListener('error', (e) => {
  if (e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode> // не го използваме за development, за да не се дублират рендери
    <App />
  // </React.StrictMode>
);

reportWebVitals();
