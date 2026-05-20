import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import SearchStudents from '../../../application/use-cases/searchStudents';
import { UserSchemas } from '@uniconnect/api-types';

interface SearchControllerUseCases {
  searchStudents: SearchStudents;
}

export default class SearchController {
  private searchStudentsUC: SearchStudents;

  constructor(useCases: SearchControllerUseCases) {
    this.searchStudentsUC = useCases.searchStudents;
  }

  public searchStudents = asyncHandler(async (req: Request, res: Response) => {
    // Validate search query using central SearchStudentsQuerySchema
    const validatedQuery = UserSchemas.SearchStudentsQuerySchema.parse({
      query: req.query.name as string,
      ...req.query
    });

    const results = await this.searchStudentsUC.execute({
      name: validatedQuery.name,
      subjectId: validatedQuery.subjectId,
      excludeId: validatedQuery.excludeId
    });
    res.json(results);
  });
}

