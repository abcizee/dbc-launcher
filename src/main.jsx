import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Подключаем глобальные стили
import './styles/global.scss';

// Рендерим приложение (используем createRoot напрямую)
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);