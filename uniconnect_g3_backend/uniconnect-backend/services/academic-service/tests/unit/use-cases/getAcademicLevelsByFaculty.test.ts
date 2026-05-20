import { describe, test, expect, jest } from '@jest/globals';
import { GetAcademicLevelsByFaculty } from '../../../src/application/use-cases/getAcademicLevelsByFaculty';
import { IAcademicCatalogRepository } from '../../../src/domain/repositories';

describe('Use Case: GetAcademicLevelsByFaculty', () => {
  test('Debe retornar los niveles académicos de la facultad', async () => {
    const mockRepo: jest.Mocked<IAcademicCatalogRepository> = {
      getMappingsByFilter: jest.fn<any>().mockResolvedValue([
        { id: 'm1', formationLevelId: 'f1', facultyId: 'fac1', academicLevelId: 'a1', careerId: 'c1' },
      ]),
      getAcademicLevelsByIds: jest.fn<any>().mockResolvedValue([
        { id: 'a1', name: 'Pregrado' }
      ]),
    } as unknown as jest.Mocked<IAcademicCatalogRepository>;

    const useCase = new GetAcademicLevelsByFaculty(mockRepo);
    const result = await useCase.execute('fac1');

    expect(mockRepo.getMappingsByFilter).toHaveBeenCalledWith({ facultyId: 'fac1' });
    expect(mockRepo.getAcademicLevelsByIds).toHaveBeenCalledWith(['a1']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pregrado');
  });
});
