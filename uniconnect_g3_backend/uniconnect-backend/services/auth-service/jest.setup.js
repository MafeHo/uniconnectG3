const path = require('path');
// Cargar dotenv y .env.test si están disponibles
try {
  require('dotenv').config({ path: path.join(__dirname, '.env.test') });
} catch (e) {
  // Ignorar si no está instalado, usará los fallbacks
}

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'FALLO CRÍTICO: NO SE PUEDEN EJECUTAR TESTS EN PRODUCCIÓN. ' +
    'Esto protege tu BD de usuarios reales. ' +
    'Ejecuta: NODE_ENV=test npm test'
  );
}

// Inyectar variables de entorno de prueba obligatorias
process.env.NODE_ENV = 'test';
process.env.FIREBASE_TEST_PROJECT_ID = process.env.FIREBASE_TEST_PROJECT_ID || 'test-project';
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8085';

// Mockear variables necesarias para Passport y CORS para evitar fallos de inicialización
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
process.env.DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';

console.log('════════════════════════════════════════════════════════');
console.log('AMBIENTE DE TESTING CONFIGURADO (AUTH-SERVICE WORKER)');
console.log('════════════════════════════════════════════════════════');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Emulador:', process.env.FIRESTORE_EMULATOR_HOST);
console.log('Proyecto:', process.env.FIREBASE_TEST_PROJECT_ID);
console.log('OAuth Google ID:', process.env.GOOGLE_CLIENT_ID);
console.log('OAuth Google Sec:', process.env.GOOGLE_CLIENT_SECRET);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('DASHBOARD_URL:', process.env.DASHBOARD_URL);
console.log('════════════════════════════════════════════════════════');
