import { describe, test, expect, jest } from '@jest/globals';
import { GetAllFaculties } from '../../../src/application/use-cases/getAllFaculties';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetAllFaculties', () => {
  test('Debe retornar todas las facultades correctamente', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getAllFaculties: jest.fn<any>().mockResolvedValue([{ id: '1', name: 'Facultad de Ingeniería' }]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetAllFaculties(mockRepo);
    const result = await useCase.execute();

    expect(mockRepo.getAllFaculties).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Facultad de Ingeniería');
  });
});
