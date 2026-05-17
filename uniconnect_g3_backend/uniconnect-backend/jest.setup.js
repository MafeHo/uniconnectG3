/**
 * Root Jest Setup Script
 * Se ejecuta automáticamente antes de cargar cada archivo de prueba en el worker
 * CRÍTICO: Configura el entorno de prueba aislado y seguro
 */

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'FALLO CRÍTICO: NO SE PUEDEN EJECUTAR TESTS EN PRODUCCIÓN. ' +
    'Esto protege tu base de datos de usuarios reales.'
  );
}

// Inyectar variables de entorno de prueba para el emulador local
process.env.NODE_ENV = 'test';
process.env.FIREBASE_TEST_PROJECT_ID = 'test-project';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8085';

// Mockear variables necesarias para Passport y CORS para evitar fallos de inicialización
process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
process.env.BASE_URL = 'http://localhost:3001';
process.env.DASHBOARD_URL = 'http://localhost:3000';

console.log('════════════════════════════════════════════════════════');
console.log('CONFIGURACIÓN GLOBAL JEST EN WORKER - TESTING INICIADO');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  Emulador Firestore:', process.env.FIRESTORE_EMULATOR_HOST);
console.log('  Proyecto Test:', process.env.FIREBASE_TEST_PROJECT_ID);
console.log('  OAuth Google ID:', process.env.GOOGLE_CLIENT_ID);
console.log('  OAuth Google Sec:', process.env.GOOGLE_CLIENT_SECRET);
console.log('  BASE_URL:', process.env.BASE_URL);
console.log('  DASHBOARD_URL:', process.env.DASHBOARD_URL);
console.log('════════════════════════════════════════════════════════');
