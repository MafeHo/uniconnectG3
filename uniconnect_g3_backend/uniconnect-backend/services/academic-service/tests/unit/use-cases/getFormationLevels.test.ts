import { describe, test, expect, jest } from '@jest/globals';
import { GetFormationLevels } from '../../../src/application/use-cases/getFormationLevels';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetFormationLevels', () => {
  test('Debe retornar niveles de formación filtrados sin duplicados', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getMappingsByFilter: jest.fn<any>().mockResolvedValue([
        { id: 'm1', formationLevelId: 'f1', facultyId: 'fac1', academicLevelId: 'a1', careerId: 'c1' },
        { id: 'm2', formationLevelId: 'f1', facultyId: 'fac1', academicLevelId: 'a1', careerId: 'c2' },
        { id: 'm3', formationLevelId: 'f2', facultyId: 'fac1', academicLevelId: 'a1', careerId: 'c3' }
      ]),
      getFormationLevelsByIds: jest.fn<any>().mockResolvedValue([
        { id: 'f1', name: 'Pregrado' },
        { id: 'f2', name: 'Posgrado' }
      ]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetFormationLevels(mockRepo);
    const result = await useCase.execute('fac1', 'a1');

    expect(mockRepo.getMappingsByFilter).toHaveBeenCalledWith({ facultyId: 'fac1', academicLevelId: 'a1' });
    expect(mockRepo.getFormationLevelsByIds).toHaveBeenCalledWith(['f1', 'f2']);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Pregrado');
  });
});
