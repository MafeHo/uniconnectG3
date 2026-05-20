import { describe, test, expect, jest } from '@jest/globals';
import { GetAllSubjects } from '../../../src/application/use-cases/getAllSubjects';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetAllSubjects', () => {
  test('Debe retornar todas las materias correctamente', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getAllSubjects: jest.fn<any>().mockResolvedValue([{ id: 's1', name: 'Arquitectura Limpia' }]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetAllSubjects(mockRepo);
    const result = await useCase.execute();

    expect(mockRepo.getAllSubjects).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Arquitectura Limpia');
  });
});
