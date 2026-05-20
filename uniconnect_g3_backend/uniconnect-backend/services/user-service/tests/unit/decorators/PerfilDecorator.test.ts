import { describe, test, expect } from '@jest/globals';
import { z } from 'zod';
import { PerfilBase } from '../../../src/domain/decorators/PerfilBase';
import { PerfilDecorator } from '../../../src/domain/decorators/PerfilDecorator';
import { PerfilConEstadisticas } from '../../../src/domain/decorators/PerfilConEstadisticas';
import { PerfilConInsignias } from '../../../src/domain/decorators/PerfilConInsignias';
import { User } from '@uniconnect/shared';

// Esquema Zod obligatorio para validación de datos
const UserProfileSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  estadisticas: z.object({
    gruposCreados: z.number(),
    gruposParticipa: z.number(),
    mensajesEnviados: z.number()
  }).optional(),
  insignias: z.array(z.string()).optional()
});

describe('Decoradores de Perfil de Usuario', () => {
  const baseUserData: User = {
    uid: 'user123',
    name: 'Juan Perez',
    email: 'juan.perez@ucaldas.edu.co'
  };

  test('PerfilBase debe retornar los datos de perfil base y validar con Zod', () => {
    const perfilBase = new PerfilBase(baseUserData);
    const result = perfilBase.getProfileData();
    
    // Validación con Zod
    expect(() => UserProfileSchema.parse(result)).not.toThrow();
    expect(result.uid).toBe('user123');
    expect(result.name).toBe('Juan Perez');
  });

  test('PerfilDecorator debe delegar los métodos correctamente', () => {
    const perfilBase = new PerfilBase(baseUserData);
    const decorator = new PerfilDecorator(perfilBase);
    const result = decorator.getProfileData();

    expect(() => UserProfileSchema.parse(result)).not.toThrow();
    expect(result.name).toBe('Juan Perez');
  });

  test('PerfilConEstadisticas debe agregar estadisticas correctas y valores por defecto', () => {
    const perfilBase = new PerfilBase(baseUserData);
    const perfilConStats = new PerfilConEstadisticas(perfilBase, {
      gruposCreados: 2,
      gruposParticipa: 5
    });

    const result = perfilConStats.getProfileData();
    expect(() => UserProfileSchema.parse(result)).not.toThrow();
    expect(result.estadisticas).toBeDefined();
    expect(result.estadisticas?.gruposCreados).toBe(2);
    expect(result.estadisticas?.gruposParticipa).toBe(5);
    expect(result.estadisticas?.mensajesEnviados).toBe(0); // Por defecto
  });

  test('PerfilConEstadisticas debe manejar stats null o parciales', () => {
    const perfilBase = new PerfilBase(baseUserData);
    
    // Stats undefined/null
    const perfilNullStats = new PerfilConEstadisticas(perfilBase, null as any);
    const resNull = perfilNullStats.getProfileData();
    expect(resNull.estadisticas?.gruposCreados).toBe(0);
    expect(resNull.estadisticas?.gruposParticipa).toBe(0);
    expect(resNull.estadisticas?.mensajesEnviados).toBe(0);

    // Stats parciales con cero
    const perfilZeroStats = new PerfilConEstadisticas(perfilBase, {
      gruposCreados: 0,
      gruposParticipa: 0,
      mensajesEnviados: 0
    });
    const resZero = perfilZeroStats.getProfileData();
    expect(resZero.estadisticas?.gruposCreados).toBe(0);
  });

  test('PerfilConInsignias debe otorgar insignias correctas basadas en estadisticas', () => {
    const perfilBase = new PerfilBase(baseUserData);
    
    // Caso 1: Sin estadísticas (sin insignias)
    const decorador1 = new PerfilConInsignias(perfilBase);
    const res1 = decorador1.getProfileData();
    expect(res1.insignias).toEqual([]);

    // Caso 2: Con suficientes estadísticas para varias insignias
    const perfilConStats = new PerfilConEstadisticas(perfilBase, {
      gruposCreados: 1,
      gruposParticipa: 3,
      mensajesEnviados: 55
    });
    const decorador2 = new PerfilConInsignias(perfilConStats);
    const res2 = decorador2.getProfileData();

    expect(() => UserProfileSchema.parse(res2)).not.toThrow();
    expect(res2.insignias).toContain('Comunicador Frecuente'); // > 10
    expect(res2.insignias).toContain('Gran Hablador'); // >= 50
    expect(res2.insignias).toContain('Líder de Estudio'); // >= 1
    expect(res2.insignias).toContain('Colaborador Activo'); // >= 3
  });
});
