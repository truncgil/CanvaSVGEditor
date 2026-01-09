import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Canva API'yi başlat
async function initCanva() {
  try {
    // Canva API başlatma işlemleri burada yapılabilir
    // Örnek: await init() gibi bir fonksiyon çağrılabilir
    console.log('Canva API başlatıldı');
  } catch (error) {
    console.error('Canva API başlatma hatası:', error);
  }
}

// Uygulamayı başlat
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element bulunamadı');
}

const root = ReactDOM.createRoot(rootElement);

// Canva API'yi başlat ve uygulamayı render et
initCanva().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
