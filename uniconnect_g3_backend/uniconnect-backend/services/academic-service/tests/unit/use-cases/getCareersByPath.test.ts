import { describe, test, expect, jest } from '@jest/globals';
import { GetCareersByPath } from '../../../src/application/use-cases/getCareersByPath';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetCareersByPath', () => {
  test('Debe retornar las carreras asociadas a la ruta académica completa', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getMappingsByFilter: jest.fn<any>().mockResolvedValue([
        { id: 'm1', formationLevelId: 'f1', facultyId: 'fac1', academicLevelId: 'a1', careerId: 'c1' },
      ]),
      getCareersByIds: jest.fn<any>().mockResolvedValue([
        { id: 'c1', name: 'Ingeniería de Sistemas', facultyId: 'fac1' }
      ]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetCareersByPath(mockRepo);
    const result = await useCase.execute('fac1', 'a1', 'f1');

    expect(mockRepo.getMappingsByFilter).toHaveBeenCalledWith({ facultyId: 'fac1', academicLevelId: 'a1', formationLevelId: 'f1' });
    expect(mockRepo.getCareersByIds).toHaveBeenCalledWith(['c1']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ingeniería de Sistemas');
  });
});
