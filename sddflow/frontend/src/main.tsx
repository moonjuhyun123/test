import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installMockFetch } from './api/mocks';
import './design/global.css';

installMockFetch();

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
