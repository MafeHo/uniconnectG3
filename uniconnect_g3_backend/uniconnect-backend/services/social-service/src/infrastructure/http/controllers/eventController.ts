import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { SocialSchemas, UserSchemas } from '@uniconnect/api-types';

interface UseCase {
  execute(...args: any[]): Promise<any>;
}

export interface EventUseCases {
  getEvents: UseCase;
  getCategories: UseCase;
  subscribeToCategory: UseCase;
  unsubscribeFromCategory: UseCase;
  getSubscribedCategories: UseCase;
  createEvent: UseCase;
}

export class EventController {
  private getEventsUC: UseCase;
  private getCategoriesUC: UseCase;
  private subscribeToCategoryUC: UseCase;
  private unsubscribeFromCategoryUC: UseCase;
  private getSubscribedCategoriesUC: UseCase;
  private createEventUC: UseCase;

  constructor(useCases: EventUseCases) {
    this.getEventsUC = useCases.getEvents;
    this.getCategoriesUC = useCases.getCategories;
    this.subscribeToCategoryUC = useCases.subscribeToCategory;
    this.unsubscribeFromCategoryUC = useCases.unsubscribeFromCategory;
    this.getSubscribedCategoriesUC = useCases.getSubscribedCategories;
    this.createEventUC = useCases.createEvent;
  }

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = SocialSchemas.CreateEventRequestSchema.parse(req.body);
    const event = await this.createEventUC.execute(validatedData);
    res.status(201).json(event);
  });

  getEvents = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.query.category || req.query.categoryId;
    const events = await this.getEventsUC.execute({ categoryId });
    res.status(200).json(events);
  });

  getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.getCategoriesUC.execute();
    res.status(200).json(categories);
  });

  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const { userId, categoryId } = SocialSchemas.SubscribeCategoryRequestSchema.parse(req.body);

    try {
      await this.subscribeToCategoryUC.execute(userId, categoryId);
      return res.status(201).json({ message: 'Suscripción creada exitosamente' });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ALREADY_SUBSCRIBED') {
        return res.status(409).json({ error: 'El estudiante ya está suscrito a esta categoría' });
      }
      throw err;
    }
  });

  unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { userId, categoryId } = SocialSchemas.UnsubscribeCategoryQuerySchema.parse(req.query);
    await this.unsubscribeFromCategoryUC.execute(userId, categoryId);
    return res.status(204).send();
  });

  getSubscribedCategories = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = UserSchemas.UserIdParamSchema.parse(req.params);
    const subscriptions = await this.getSubscribedCategoriesUC.execute(userId);
    return res.status(200).json(subscriptions);
  });
}
export default EventController;

