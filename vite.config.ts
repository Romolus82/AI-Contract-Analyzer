import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente dal file .env nella directory corrente.
  // Il terzo parametro '' carica tutte le variabili, indipendentemente dal prefisso VITE_.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Questo espone la variabile API_KEY dal tuo file .env
      // al codice dell'applicazione attraverso 'process.env.API_KEY'.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
});
