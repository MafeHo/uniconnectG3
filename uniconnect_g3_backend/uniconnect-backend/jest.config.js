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
  // Directorio de salida de los reportes de cobertura de código
  coverageDirectory: '<rootDir>/coverage',
  // Configuración de umbrales mínimos de cobertura (coverageThreshold)
  coverageThreshold: {
    // Cobertura global requerida para todo el proyecto (70%)
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Cobertura específica para módulos vinculados al patrón Decorator (85% o superior)
    './**/decorators/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './**/*decorator*': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Cobertura específica para módulos vinculados al patrón Observer (85% o superior)
    './**/observer/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './**/observers/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './**/*observer*': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // Asegura la salida limpia de Jest al finalizar
  forceExit: true,
  detectOpenHandles: true
};
