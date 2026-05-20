import { describe, test, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { Group } from '../../src/domain/Group';

// 1. Zod Schemas para validación estricta de estado
export const GroupStateEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED']);

export const StudyGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  subjectId: z.string().min(1, "El subjectId es requerido"),
  description: z.string().optional(),
  creatorId: z.string().min(1, "El creatorId es requerido"),
  state: GroupStateEnum,
});

// 2. Excepciones de Dominio con códigos de error específicos
export class DomainException extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainException';
    this.code = code;
  }
}

export class InvalidTransitionException extends DomainException {
  constructor(message: string = 'Transición de estado inválida') {
    super(message, 'INVALID_STATUS_TRANSITION');
  }
}

export class InvalidStateException extends DomainException {
  constructor(message: string = 'Operación inválida para el estado actual') {
    super(message, 'INVALID_STATE');
  }
}

// 3. Entidad Wrapper de Dominio (para aislar la lógica de estado a testear)
export class StudyGroup extends Group {
  constructor(data: any) {
    super(data);
    if (!this.state) {
      this.state = 'ACTIVE'; // Default en creación (UC-GROUP-001)
    }
    // Validación estricta Zod al instanciar
    StudyGroupSchema.parse(this);
  }

  public publish(): void {
    if (this.state === 'DELETED') throw new InvalidTransitionException('No se puede activar un grupo eliminado');
    this.state = 'ACTIVE';
    this.validateState();
  }

  public archive(): void {
    if (this.state === 'DELETED') throw new InvalidTransitionException('No se puede archivar un grupo eliminado');
    if (this.state === 'DRAFT') throw new InvalidTransitionException('No se puede archivar un borrador');
    this.state = 'ARCHIVED';
    this.validateState();
  }

  public softDelete(): void {
    this.state = 'DELETED';
    this.validateState();
  }

  public unarchive(): void {
    if (this.state === 'DELETED') throw new InvalidTransitionException('No se puede desarchivar un grupo eliminado');
    this.state = 'ACTIVE';
    this.validateState();
  }

  public updateDetails(name: string, description: string): void {
    if (this.state === 'ARCHIVED') throw new InvalidStateException('Un grupo archivado es de solo lectura');
    if (this.state === 'DELETED') throw new InvalidStateException('No se puede modificar un grupo eliminado');
    
    this.name = name;
    this.description = description;
    this.validateState(); // Validará que el nombre siga cumpliendo las reglas de Zod
  }

  // Utilidad interna para validar tras cada transición
  private validateState(): void {
    StudyGroupSchema.parse(this);
  }

  // Constructor factory para simular hidratación desde BD
  static loadFromDb(data: any): StudyGroup {
    return new StudyGroup(data);
  }
}

// 4. Suite de Pruebas Unitarias
describe('Group Lifecycle & State Transitions - Zod Validation', () => {
  let validPayload: any;

  beforeEach(() => {
    validPayload = {
      id: 'group-101',
      name: 'Grupo Frontend',
      subjectId: 'SUBJ-001',
      description: 'Estudio de React',
      creatorId: 'user-auth-01'
    };
  });

  describe('Transiciones Válidas (Pruebas Positivas)', () => {
    
    test('UC-GROUP-001: Crear grupo inicia en estado ACTIVE y es válido en Zod', () => {
      const group = new StudyGroup(validPayload);
      
      expect(group.state).toBe('ACTIVE');
      expect(() => StudyGroupSchema.parse(group)).not.toThrow();
    });

    test('UC-GROUP-002: DRAFT -> ACTIVE (Publicar)', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'DRAFT' });
      group.publish();
      
      expect(group.state).toBe('ACTIVE');
      expect(StudyGroupSchema.safeParse(group).success).toBe(true);
    });

    test('UC-GROUP-003: ACTIVE -> ARCHIVED (Archivar)', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'ACTIVE' });
      group.archive();
      
      expect(group.state).toBe('ARCHIVED');
      expect(StudyGroupSchema.safeParse(group).success).toBe(true);
    });

    test('UC-GROUP-004/005/006: Cualquier estado válido -> DELETED (Soft Delete)', () => {
      const statesToTest = ['ACTIVE', 'ARCHIVED', 'DRAFT'];
      
      statesToTest.forEach(state => {
        const group = StudyGroup.loadFromDb({ ...validPayload, state });
        group.softDelete();
        expect(group.state).toBe('DELETED');
        expect(StudyGroupSchema.safeParse(group).success).toBe(true);
      });
    });

    test('UC-GROUP-007: ARCHIVED -> ACTIVE (Desarchivar)', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'ARCHIVED' });
      group.unarchive();
      
      expect(group.state).toBe('ACTIVE');
      expect(StudyGroupSchema.safeParse(group).success).toBe(true);
    });
  });

  describe('Transiciones Inválidas y Validación Zod (Pruebas Negativas)', () => {

    test('UC-GROUP-008: Modificar grupo ARCHIVED lanza InvalidStateException', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'ARCHIVED' });
      
      expect(() => {
        group.updateDetails('Nuevo Nombre', 'Nueva Desc');
      }).toThrow(InvalidStateException);
      
      try {
        group.updateDetails('Nuevo Nombre', 'Nueva Desc');
      } catch (error: any) {
        expect(error.code).toBe('INVALID_STATE');
      }
    });

    test('UC-GROUP-009: DELETED -> ACTIVE lanza InvalidTransitionException', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'DELETED' });
      
      expect(() => group.publish()).toThrow(InvalidTransitionException);
      try {
        group.publish();
      } catch (error: any) {
        expect(error.code).toBe('INVALID_STATUS_TRANSITION');
      }
    });

    test('UC-GROUP-010: DELETED -> ARCHIVED lanza InvalidTransitionException', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'DELETED' });
      
      expect(() => group.archive()).toThrow(InvalidTransitionException);
    });

    test('UC-GROUP-011: DRAFT -> ARCHIVED lanza InvalidTransitionException', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'DRAFT' });
      
      expect(() => group.archive()).toThrow(InvalidTransitionException);
    });

    test('UC-GROUP-013: Forzar estado no reconocido lanza ZodError directamente en inicialización', () => {
      expect(() => {
        new StudyGroup({ ...validPayload, state: 'EN_PAUSA' });
      }).toThrow(z.ZodError); // Zod captura el enum inválido

      try {
        new StudyGroup({ ...validPayload, state: 'EN_PAUSA' });
      } catch (error: any) {
        expect(error).toBeInstanceOf(z.ZodError);
        expect(error.issues[0].message).toContain('Invalid enum value');
      }
    });

    test('Forzar un cambio de nombre a formato inválido rompe el esquema Zod tras transición interna', () => {
      const group = StudyGroup.loadFromDb({ ...validPayload, state: 'ACTIVE' });
      
      expect(() => {
        // Intenta romper Zod con un string vacío (min 3 chars en Schema)
        group.updateDetails('A', 'Desc'); 
      }).toThrow(z.ZodError);
    });
  });
});
