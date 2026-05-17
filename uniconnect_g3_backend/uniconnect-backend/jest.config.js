/**
 * Root Jest Configuration
 * Centraliza la configuración de pruebas para todos los microservicios
 */

module.exports = {
  testEnvironment: 'node',
  // Inyecta las variables de entorno antes de importar los archivos de prueba en cada worker
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/services/*/tests/integration/**/*.test.js',
    '**/services/*/tests/unit/**/*.test.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  // Asegura la salida limpia de Jest al finalizar
  forceExit: true,
  detectOpenHandles: true
};
