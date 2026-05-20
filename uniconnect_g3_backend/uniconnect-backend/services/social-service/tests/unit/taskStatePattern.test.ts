import { describe, test, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';

// 1. Zod Schemas para Validación Estricta
export const TaskStateEnum = z.enum(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'OVERDUE']);

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  assigneeId: z.string().min(1, "El asignado es requerido"),
  state: TaskStateEnum,
});

// 2. Excepciones de Dominio (Códigos específicos de Error)
export class DomainException extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainException';
    this.code = code;
  }
}

export class InvalidTaskTransitionException extends DomainException {
  constructor(message: string = 'Transición de estado de tarea inválida') {
    super(message, 'INVALID_TASK_TRANSITION');
  }
}

export class TaskAlreadyFinalizedException extends DomainException {
  constructor(message: string = 'La tarea ya finalizó y no puede cambiar de estado') {
    super(message, 'TASK_ALREADY_FINALIZED');
  }
}

// 3. Patrón State - Interfaces y Clases Base
export interface ITaskState {
  start(): void;
  sendToReview(): void;
  complete(): void;
  markAsOverdue(): void;
  getStateName(): z.infer<typeof TaskStateEnum>;
}

export class TaskContext {
  public id?: string;
  public title: string;
  public assigneeId: string;
  private _state: ITaskState;

  constructor(data: any, initialStateFactory?: (ctx: TaskContext) => ITaskState) {
    this.id = data.id;
    this.title = data.title;
    this.assigneeId = data.assigneeId;
    
    // Si pasamos un factory, iniciamos en ese estado. Por defecto PENDING.
    this._state = initialStateFactory ? initialStateFactory(this) : new PendingState(this);
    
    // Validación estricta Zod en la inicialización
    this.validate();
  }

  public get stateName(): string {
    return this._state.getStateName();
  }

  public setState(newState: ITaskState): void {
    this._state = newState;
    this.validate(); // Valida con Zod cada vez que el estado cambia
  }

  // Delegación de comportamiento al estado actual
  public start(): void { this._state.start(); }
  public sendToReview(): void { this._state.sendToReview(); }
  public complete(): void { this._state.complete(); }
  public markAsOverdue(): void { this._state.markAsOverdue(); }

  private validate(): void {
    TaskSchema.parse({
      id: this.id,
      title: this.title,
      assigneeId: this.assigneeId,
      state: this.stateName
    });
  }
}

// Implementación de Estados Concretos
abstract class BaseTaskState implements ITaskState {
  protected context: TaskContext;
  constructor(context: TaskContext) {
    this.context = context;
  }
  
  // Por defecto, cualquier transición lanza error a menos que se sobreescriba en el estado concreto
  public start(): void { throw new InvalidTaskTransitionException('Transición inválida hacia IN_PROGRESS'); }
  public sendToReview(): void { throw new InvalidTaskTransitionException('Transición inválida hacia IN_REVIEW'); }
  public complete(): void { throw new InvalidTaskTransitionException('Transición inválida hacia COMPLETED'); }
  public markAsOverdue(): void { throw new InvalidTaskTransitionException('Transición inválida hacia OVERDUE'); }
  
  abstract getStateName(): z.infer<typeof TaskStateEnum>;
}

class PendingState extends BaseTaskState {
  getStateName() { return 'PENDING' as const; }
  public start(): void { this.context.setState(new InProgressState(this.context)); }
  public markAsOverdue(): void { this.context.setState(new OverdueState(this.context)); }
}

class InProgressState extends BaseTaskState {
  getStateName() { return 'IN_PROGRESS' as const; }
  public sendToReview(): void { this.context.setState(new InReviewState(this.context)); }
  public markAsOverdue(): void { this.context.setState(new OverdueState(this.context)); }
}

class InReviewState extends BaseTaskState {
  getStateName() { return 'IN_REVIEW' as const; }
  public complete(): void { this.context.setState(new CompletedState(this.context)); }
  public markAsOverdue(): void { this.context.setState(new OverdueState(this.context)); }
}

class CompletedState extends BaseTaskState {
  getStateName() { return 'COMPLETED' as const; }
  public start(): void { throw new TaskAlreadyFinalizedException(); }
  public sendToReview(): void { throw new TaskAlreadyFinalizedException(); }
  public markAsOverdue(): void { throw new TaskAlreadyFinalizedException(); }
  public complete(): void { throw new TaskAlreadyFinalizedException(); }
}

class OverdueState extends BaseTaskState {
  getStateName() { return 'OVERDUE' as const; }
  public start(): void { throw new TaskAlreadyFinalizedException('No se puede reiniciar una tarea vencida'); }
  public sendToReview(): void { throw new TaskAlreadyFinalizedException('No se puede enviar a revisión una tarea vencida'); }
  public markAsOverdue(): void { throw new TaskAlreadyFinalizedException('La tarea ya está vencida'); }
  public complete(): void { throw new TaskAlreadyFinalizedException('No se puede completar directamente una tarea vencida'); }
}


// 4. Suite de Pruebas Unitarias
describe('Task Lifecycle & State Transitions - State Pattern & Zod Validation', () => {
  let validPayload: any;

  beforeEach(() => {
    validPayload = {
      id: 'task-001',
      title: 'Crear componente UI',
      assigneeId: 'user-frontend-1'
    };
  });

  describe('Transiciones Válidas (Pruebas Positivas)', () => {
    
    test('Debe iniciar la tarea correctamente en PENDING', () => {
      const task = new TaskContext(validPayload);
      expect(task.stateName).toBe('PENDING');
      expect(() => TaskSchema.parse({ ...validPayload, state: task.stateName })).not.toThrow();
    });

    test('PENDING -> IN_PROGRESS: Debe iniciar el progreso de la tarea', () => {
      const task = new TaskContext(validPayload); // PENDING por defecto
      task.start();
      expect(task.stateName).toBe('IN_PROGRESS');
      expect(() => TaskSchema.parse({ ...validPayload, state: task.stateName })).not.toThrow();
    });

    test('IN_PROGRESS -> IN_REVIEW: Debe enviar la tarea a revisión', () => {
      const task = new TaskContext(validPayload, (ctx) => new InProgressState(ctx));
      task.sendToReview();
      expect(task.stateName).toBe('IN_REVIEW');
    });

    test('IN_REVIEW -> COMPLETED: Debe finalizar exitosamente la tarea', () => {
      const task = new TaskContext(validPayload, (ctx) => new InReviewState(ctx));
      task.complete();
      expect(task.stateName).toBe('COMPLETED');
    });

    test('PENDING / IN_PROGRESS / IN_REVIEW -> OVERDUE: Debe poder vencerse desde estados activos', () => {
      const taskPending = new TaskContext(validPayload, (ctx) => new PendingState(ctx));
      taskPending.markAsOverdue();
      expect(taskPending.stateName).toBe('OVERDUE');

      const taskProgress = new TaskContext(validPayload, (ctx) => new InProgressState(ctx));
      taskProgress.markAsOverdue();
      expect(taskProgress.stateName).toBe('OVERDUE');

      const taskReview = new TaskContext(validPayload, (ctx) => new InReviewState(ctx));
      taskReview.markAsOverdue();
      expect(taskReview.stateName).toBe('OVERDUE');
    });
  });

  describe('Transiciones Inválidas (Pruebas Negativas)', () => {
    
    test('PENDING -> COMPLETED: Salto directo prohibido', () => {
      const task = new TaskContext(validPayload); // PENDING
      
      expect(() => task.complete()).toThrow(InvalidTaskTransitionException);
      try {
        task.complete();
      } catch (error: any) {
        expect(error.code).toBe('INVALID_TASK_TRANSITION');
      }
    });

    test('COMPLETED -> IN_PROGRESS: No se puede reiniciar una tarea finalizada', () => {
      const task = new TaskContext(validPayload, (ctx) => new CompletedState(ctx));
      
      expect(() => task.start()).toThrow(TaskAlreadyFinalizedException);
      try {
        task.start();
      } catch (error: any) {
        expect(error.code).toBe('TASK_ALREADY_FINALIZED');
      }
    });

    test('OVERDUE -> IN_PROGRESS / COMPLETED: No se puede transicionar una tarea vencida', () => {
      const task = new TaskContext(validPayload, (ctx) => new OverdueState(ctx));
      
      expect(() => task.start()).toThrow(TaskAlreadyFinalizedException);
      expect(() => task.complete()).toThrow(TaskAlreadyFinalizedException);
    });

    test('Zod Rechaza la creación de una tarea con un título inválido directamente en State Context', () => {
      expect(() => {
        new TaskContext({ ...validPayload, title: 'ab' }); // Mínimo 3 caracteres
      }).toThrow(z.ZodError);
    });
    
  });
});
