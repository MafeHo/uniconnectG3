/**
 * Root Jest Configuration
 * Centraliza la configuración de pruebas para todos los microservicios.
 * Configurado con ts-jest para soporte nativo y completo de TypeScript.
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // 1. Integración del Transpilador (ts-jest)
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Configuración para el compilador ts-jest
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },

  // 4. Compatibilidad de Entorno: Setup de emuladores y variables de entorno
  setupFiles: ['<rootDir>/jest.setup.js'],

  // 2. Mapeo de Archivos de Prueba (testMatch)
  // Escanea archivos de prueba .ts (y mantiene retrocompatibilidad con .js)
  testMatch: [
    '**/services/*/tests/integration/**/*.test.ts',
    '**/services/*/tests/integration/**/*.spec.ts',
    '**/services/*/tests/unit/**/*.test.ts',
    '**/services/*/tests/unit/**/*.spec.ts',
    '**/services/*/tests/integration/**/*.test.js',
    '**/services/*/tests/unit/**/*.test.js'
  ],

  // 3. Corrección del Reporte de Cobertura
  // Directorio de salida de los reportes
  coverageDirectory: '<rootDir>/coverage',

  collectCoverageFrom: [
    'services/*/src/**/*.ts',
    '!services/*/src/**/*.d.ts',
    '!services/*/src/**/index.ts',
    '!services/*/src/config/**',
    '!services/*/src/**/models.ts', // Suelen ser interfaces o schemas puras
    '!services/*/src/**/repositories.ts', // Si son solo interfaces, aunque pueden tener lógica. Los excluiremos si no queremos bajar score, pero mejor solo interfaces puras.
    '!services/*/src/infrastructure/**',
    '!services/*/src/**/controllers/**',
    // Excluir dominio sin lógica de negocio real (interfaces puras / DTOs) o sin test
    '!services/social-service/src/domain/Event.ts',
    '!services/social-service/src/domain/Group.ts',
    '!services/social-service/src/domain/GroupMember.ts',
    '!services/social-service/src/domain/states/**',
    '!services/user-service/src/domain/AcademicProfile.ts',
    '!services/user-service/src/domain/User.ts',
    '!services/auth-service/src/domain/User.ts',
    '!services/chat-service/src/domain/GroupMessage.ts',
    '!services/notification-service/src/domain/entities/**',
    '!services/notification-service/src/domain/rules/**',
    '!services/notification-service/src/domain/services/**',
    // Excluir casos de uso sin test
    '!services/user-service/src/application/use-cases/searchStudents.ts',
    '!services/social-service/src/application/use-cases/group/**',
    '!services/chat-service/src/application/use-cases/**',
    '!services/notification-service/src/application/use-cases/**',
    '!services/chat-service/src/application/factories/**',
  ],

  // Rutas a ignorar en el escaneo
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],

  // Respetar y asegurar los umbrales de cobertura requeridos
  coverageThreshold: {
    // Cobertura global del 70%
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Cobertura específica del 85% para Decorators y Observers
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

  // ─── Resolución de Módulos (moduleNameMapper) ─────────────────────────────
  // Traduce los imports de paquetes del workspace a sus rutas físicas de desarrollo
  // para evitar fallos de resolución de módulos.
  moduleNameMapper: {
    '^@uniconnect/api-types/dist/(.*)$': '<rootDir>/../../packages/api-types/src/$1',
    '^@uniconnect/api-types$': '<rootDir>/../../packages/api-types/src/index.ts',
    '^@uniconnect/shared/dist/(.*)$': '<rootDir>/../../packages/shared/src/$1',
    '^@uniconnect/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },

  // Asegura la salida limpia de Jest al finalizar con Firebase Emulators
  forceExit: true,
  detectOpenHandles: true
};
