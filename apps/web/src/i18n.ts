import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

i18n.use(initReactI18next).init({
  resources: { 'pt-BR': { translation: ptBR }, en: { translation: en } },
  lng: localStorage.getItem('language') ?? 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false }
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem('language', language);
  document.documentElement.lang = language;
});

export default i18n;
