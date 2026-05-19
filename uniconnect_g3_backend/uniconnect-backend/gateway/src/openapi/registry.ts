import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
extendZodWithOpenApi(z);

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();

// Import schemas to trigger their registrations and consolidate them
import './schemas/common.schemas';
import './schemas/auth.schemas';
import './schemas/user.schemas';
import './schemas/chat.schemas';
import './schemas/academic.schemas';
import './schemas/notification.schemas';
import './schemas/social.schemas';
