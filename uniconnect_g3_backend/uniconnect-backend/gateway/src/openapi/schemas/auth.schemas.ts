import { registry } from '../registry';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
  UserSchema,
  LogoutResponseSchema,
  ErrorResponseSchema
} from '@uniconnect/api-types/dist/schemas/auth.schema';

// Register models
const OpenAPIUser = registry.register('User', UserSchema);
const OpenAPILoginRequest = registry.register('LoginRequest', LoginRequestSchema);
const OpenAPIRegisterRequest = registry.register('RegisterRequest', RegisterRequestSchema);
const OpenAPIAuthResponse = registry.register('AuthResponse', AuthResponseSchema);
const OpenAPILogoutResponse = registry.register('LogoutResponse', LogoutResponseSchema);

// Register paths
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Iniciar sesión',
  tags: ['Autenticación'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: OpenAPILoginRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Sesión iniciada exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIAuthResponse,
        },
      },
    },
    401: {
      description: 'Credenciales inválidas',
    },
    404: {
      description: 'Usuario no registrado en la base de datos',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  summary: 'Registrar nuevo usuario',
  tags: ['Autenticación'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: OpenAPIRegisterRequest,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario registrado y autenticado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIAuthResponse,
        },
      },
    },
    400: {
      description: 'Error en validación de datos o dominio de correo no permitido',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  summary: 'Cerrar sesión',
  tags: ['Autenticación'],
  responses: {
    200: {
      description: 'Sesión cerrada exitosamente',
      content: {
        'application/json': {
          schema: OpenAPILogoutResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  summary: 'Obtener información de la sesión actual',
  tags: ['Autenticación'],
  responses: {
    200: {
      description: 'Usuario autenticado recuperado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIUser,
        },
      },
    },
    401: {
      description: 'No autenticado o token inválido',
    },
    404: {
      description: 'Usuario no encontrado',
    },
  },
});
