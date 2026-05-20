import { describe, test, expect, jest } from '@jest/globals';
import { GetAllCareers } from '../../../src/application/use-cases/getAllCareers';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetAllCareers', () => {
  test('Debe retornar todas las carreras correctamente', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getAllCareers: jest.fn<any>().mockResolvedValue([{ id: 'c1', name: 'Ingeniería de Sistemas', facultyId: 'fac1' }]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetAllCareers(mockRepo);
    const result = await useCase.execute();

    expect(mockRepo.getAllCareers).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ingeniería de Sistemas');
  });
});
