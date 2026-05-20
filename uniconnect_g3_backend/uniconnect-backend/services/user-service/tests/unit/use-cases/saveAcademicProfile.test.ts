import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { z } from 'zod';
import SaveAcademicProfile, { SaveProfileInput } from '../../../src/application/use-cases/saveAcademicProfile';
import { IAcademicProfileRepository, IUserRepository, IAcademicCatalogRepository } from '../../../src/domain/repositories';
import GetFullProfile from '../../../src/application/use-cases/getFullProfile';

// Mockear firebase-admin antes de importar el caso de uso o dentro del entorno
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      delete: jest.fn().mockReturnValue('mock-delete')
    }
  }
}));

// Esquema de validación Zod obligatorio para el payload de entrada
const SaveProfileInputSchema = z.object({
  studentId: z.string().min(1, "studentId es requerido"),
  biography: z.string().max(500, "biografía demasiado larga").optional(),
  showEmail: z.boolean().optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{7,15}$/, "formato de teléfono inválido").optional().or(z.literal('')),
  age: z.union([z.string(), z.number()]).optional(),
  studyPreference: z.string().optional(),
  facultyId: z.string().optional(),
  academicLevelId: z.string().optional(),
  formationLevelId: z.string().optional(),
  careerId: z.string().optional(),
  subjects: z.array(z.string()).optional()
});

describe('Use Case: SaveAcademicProfile', () => {
  let mockAcademicProfileRepo: jest.Mocked<IAcademicProfileRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockCatalogRepo: jest.Mocked<IAcademicCatalogRepository>;
  let mockGetFullProfileUseCase: jest.Mocked<GetFullProfile>;
  let useCase: SaveAcademicProfile;

  beforeEach(() => {
    mockAcademicProfileRepo = {
      save: jest.fn<any>(),
      findByStudentId: jest.fn<any>()
    } as unknown as jest.Mocked<IAcademicProfileRepository>;

    mockUserRepo = {
      save: jest.fn<any>(),
      findById: jest.fn<any>()
    } as unknown as jest.Mocked<IUserRepository>;

    mockCatalogRepo = {
      getMappingsByFilter: jest.fn<any>(),
      getMappingById: jest.fn<any>(),
      getFacultyById: jest.fn<any>(),
      getAcademicLevelById: jest.fn<any>(),
      getFormationLevelById: jest.fn<any>(),
      getCareerById: jest.fn<any>(),
      getSubjectsByIds: jest.fn<any>()
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    mockGetFullProfileUseCase = {
      execute: jest.fn<any>()
    } as unknown as jest.Mocked<GetFullProfile>;

    useCase = new SaveAcademicProfile(
      mockAcademicProfileRepo,
      mockUserRepo,
      mockCatalogRepo,
      mockGetFullProfileUseCase
    );

    jest.clearAllMocks();
  });

  test('Debe fallar si los datos de entrada no cumplen con el esquema de Zod (studentId vacío o teléfono inválido)', () => {
    const invalidPayload = {
      studentId: '',
      phone: '123' // Muy corto para regexp de 7-15 digitos
    };

    const parseResult = SaveProfileInputSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      expect(parseResult.error.errors.some(e => e.path.includes('studentId'))).toBe(true);
      expect(parseResult.error.errors.some(e => e.path.includes('phone'))).toBe(true);
    }
  });

  test('Debe guardar el perfil exitosamente cuando los datos son válidos y existe un mapping académico', async () => {
    const validPayload: SaveProfileInput = {
      studentId: 'stud123',
      biography: 'Mi biografía de estudiante',
      showEmail: true,
      phone: '1234567890',
      age: 21,
      studyPreference: 'Grupal',
      facultyId: 'fac1',
      academicLevelId: 'lvl1',
      formationLevelId: 'form1',
      careerId: 'car1',
      subjects: ['sub1', 'sub2']
    };

    // Validar payload primero con Zod
    const parseResult = SaveProfileInputSchema.safeParse(validPayload);
    expect(parseResult.success).toBe(true);

    // Configurar Mocks
    const mockMapping = {
      id: 'map999',
      facultyId: 'fac1',
      academicLevelId: 'lvl1',
      formationLevelId: 'form1',
      careerId: 'car1'
    };
    mockCatalogRepo.getMappingsByFilter.mockResolvedValue([mockMapping]);
    mockUserRepo.save.mockResolvedValue(undefined);
    mockAcademicProfileRepo.save.mockResolvedValue(undefined);
    
    const mockReturnedUser = { uid: 'stud123', name: 'Test User' };
    mockGetFullProfileUseCase.execute.mockResolvedValue(mockReturnedUser as any);

    const result = await useCase.execute(validPayload);

    // Comprobaciones
    expect(mockCatalogRepo.getMappingsByFilter).toHaveBeenCalledWith({
      facultyId: 'fac1',
      academicLevelId: 'lvl1',
      formationLevelId: 'form1',
      careerId: 'car1'
    });

    expect(mockUserRepo.save).toHaveBeenCalledWith('stud123', expect.objectContaining({
      biography: 'Mi biografía de estudiante',
      showEmail: true,
      phone: '1234567890',
      age: 21,
      studyPreference: 'Grupal'
    }));

    expect(mockAcademicProfileRepo.save).toHaveBeenCalledWith('stud123', expect.objectContaining({
      studentId: 'stud123',
      mappingId: 'map999',
      subjects: ['sub1', 'sub2']
    }));

    expect(mockGetFullProfileUseCase.execute).toHaveBeenCalledWith('stud123');
    expect(result).toEqual(mockReturnedUser);
  });

  test('Debe guardar el perfil con mapping vacío e imprimir advertencia si no se encuentra mapping académico', async () => {
    const validPayload: SaveProfileInput = {
      studentId: 'stud123',
      biography: 'Estudiante sin mapping',
      facultyId: 'facUnknown'
    };

    const parseResult = SaveProfileInputSchema.safeParse(validPayload);
    expect(parseResult.success).toBe(true);

    // Mocks retornan array vacío para mapping
    mockCatalogRepo.getMappingsByFilter.mockResolvedValue([]);
    mockUserRepo.save.mockResolvedValue(undefined);
    mockAcademicProfileRepo.save.mockResolvedValue(undefined);
    
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    await useCase.execute(validPayload);

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(mockAcademicProfileRepo.save).toHaveBeenCalledWith('stud123', expect.objectContaining({
      mappingId: ''
    }));

    consoleWarnSpy.mockRestore();
  });
});
