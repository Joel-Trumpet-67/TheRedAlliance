// Polyfill crypto.getRandomValues for environments missing it
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.getRandomValues === 'undefined') {
  // @ts-ignore
  globalThis.crypto.getRandomValues = function <T extends ArrayBufferView>(arr: T): T {
    const bytes = arr as unknown as Uint8Array;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
