import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminLayout from './routes/admin';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminLayout />
  </StrictMode>
);
