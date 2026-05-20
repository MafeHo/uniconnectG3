import { describe, test, expect, jest } from '@jest/globals';
import { GetCareerStructure } from '../../../src/application/use-cases/getCareerStructure';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetCareerStructure', () => {
  test('Debe retornar la estructura organizada de la carrera', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getSectionsByCareerId: jest.fn<any>().mockResolvedValue([
        { id: 'sec1', name: 'Semestre 1', careerId: 'c1' },
      ]),
      getAllSubjects: jest.fn<any>().mockResolvedValue([
        { id: 'sub1', name: 'Matemáticas', sectionId: 'sec1' },
        { id: 'sub2', name: 'Historia', sectionId: 'sec2' } // No pertenece a sec1
      ]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetCareerStructure(mockRepo);
    const result = await useCase.execute('c1');

    expect(mockRepo.getSectionsByCareerId).toHaveBeenCalledWith('c1');
    expect(mockRepo.getAllSubjects).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].sectionName).toBe('Semestre 1');
    expect(result[0].subjects).toHaveLength(1);
    expect(result[0].subjects[0].name).toBe('Matemáticas');
  });

  test('Debe lanzar error si no se encuentran secciones (STRUCTURE_NOT_FOUND)', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getSectionsByCareerId: jest.fn<any>().mockResolvedValue([]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetCareerStructure(mockRepo);
    await expect(useCase.execute('c99')).rejects.toThrow('STRUCTURE_NOT_FOUND');
  });
});
