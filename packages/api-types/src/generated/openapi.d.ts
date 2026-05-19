export interface paths {
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Iniciar sesión */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description Sesión iniciada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AuthResponse"];
                    };
                };
                /** @description Credenciales inválidas */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Usuario no registrado en la base de datos */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registrar nuevo usuario */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RegisterRequest"];
                };
            };
            responses: {
                /** @description Usuario registrado y autenticado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AuthResponse"];
                    };
                };
                /** @description Error en validación de datos o dominio de correo no permitido */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cerrar sesión */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Sesión cerrada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LogoutResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener información de la sesión actual */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Usuario autenticado recuperado exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                /** @description No autenticado o token inválido */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Usuario no encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/profile/{studentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener perfil del estudiante */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    studentId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Perfil recuperado exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfile"];
                    };
                };
                /** @description Perfil de estudiante no encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/profile/estadisticas/{studentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener perfil decorado con estadísticas del estudiante */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    studentId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Perfil decorado recuperado exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfile"];
                    };
                };
                /** @description Estudiante no encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear o actualizar perfil del estudiante */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpsertProfileRequest"];
                };
            };
            responses: {
                /** @description Perfil actualizado exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfile"];
                    };
                };
                /** @description Perfil creado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfile"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Buscar estudiantes con filtros */
        get: {
            parameters: {
                query?: {
                    query?: string;
                    career?: string;
                    semester?: number | null;
                    page?: number | null;
                    limit?: number | null;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Resultados de búsqueda recuperados exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SearchStudentsResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear un nuevo chat privado o grupal */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateChatRequest"];
                };
            };
            responses: {
                /** @description Chat creado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CreateChatResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chats/{chatId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener historial de mensajes de un chat */
        get: {
            parameters: {
                query?: {
                    limit?: number | null;
                    before?: string;
                };
                header?: never;
                path: {
                    chatId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Historial de mensajes recuperado exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            chatId: string;
                            senderId: string;
                            content: string;
                            /** @enum {string} */
                            type: "text" | "image" | "file" | "system";
                            fileURL?: string | null;
                            fileName?: string | null;
                            fileSize?: number | null;
                            createdAt: string;
                            readBy?: string[];
                            reactions?: {
                                [key: string]: string[];
                            };
                        }[];
                    };
                };
            };
        };
        put?: never;
        /** Enviar mensaje de texto a un chat */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    chatId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendMessageRequest"];
                };
            };
            responses: {
                /** @description Mensaje enviado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chats/{chatId}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enviar un archivo/imagen a un chat */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    chatId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description Archivo a subir (imagen, PDF, etc)
                         */
                        file: string;
                    };
                };
            };
            responses: {
                /** @description Archivo subido y mensaje creado */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chats/{chatId}/messages/{messageId}/reactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agregar reacción a un mensaje */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    chatId: string;
                    messageId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AddReactionRequest"];
                };
            };
            responses: {
                /** @description Reacción agregada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatSuccessResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/group-chats/{groupId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enviar mensaje de texto a un chat grupal */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    groupId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendMessageRequest"];
                };
            };
            responses: {
                /** @description Mensaje enviado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/group-chats/{groupId}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enviar un archivo/imagen a un chat grupal */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    groupId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description Archivo a subir (imagen, PDF, etc)
                         */
                        file: string;
                    };
                };
            };
            responses: {
                /** @description Archivo subido y mensaje creado */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/group-chats/{groupId}/messages/{messageId}/reactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agregar reacción a un mensaje de chat grupal */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    groupId: string;
                    messageId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AddReactionRequest"];
                };
            };
            responses: {
                /** @description Reacción agregada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatSuccessResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/hierarchy/faculties": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener todas las facultades */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Facultades recuperadas exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Faculty"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/hierarchy/academic-levels/{facultyId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener niveles académicos por facultad */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facultyId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Niveles académicos recuperados */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AcademicLevel"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/hierarchy/formation-levels/{facultyId}/{academicLevelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener niveles de formación por facultad y nivel académico */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facultyId: string;
                    academicLevelId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Niveles de formación recuperados */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FormationLevel"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/hierarchy/careers-by-path/{facultyId}/{academicLevelId}/{formationLevelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener carreras según ruta académica */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facultyId: string;
                    academicLevelId: string;
                    formationLevelId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Carreras recuperadas */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Career"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/careers/careers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener lista de todas las carreras */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista completa de carreras recuperada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Career"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subjects/subjects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener lista de todas las asignaturas */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de asignaturas recuperada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Subject"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/career-structure/{careerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener la estructura académica de una carrera */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    careerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Estructura académica recuperada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/notify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Emitir una notificación de evento */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["NotifyRequest"];
                };
            };
            responses: {
                /** @description Notificación procesada y enviada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener notificaciones de un usuario */
        get: {
            parameters: {
                query?: {
                    limit?: number | null;
                };
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Notificaciones recuperadas exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                            data: components["schemas"]["Notification"][];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/{userId}/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener cantidad de notificaciones no leídas */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Cantidad de notificaciones no leídas recuperada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                            unreadCount: number;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marcar una notificación como leída */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description ID del usuario para validar permisos */
                        userId: string;
                    };
                };
            };
            responses: {
                /** @description Notificación marcada como leída exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/notifications/user/{userId}/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marcar todas las notificaciones de un usuario como leídas */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Todas las notificaciones marcadas como leídas */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Buscar grupos con filtros */
        get: {
            parameters: {
                query?: {
                    query?: string;
                    subjectId?: string;
                    userSubjectIds?: string;
                    userId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Búsqueda exitosa */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Group"][];
                    };
                };
            };
        };
        put?: never;
        /** Crear un nuevo grupo de estudio */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateGroupRequest"];
                };
            };
            responses: {
                /** @description Grupo creado */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Group"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/check-name/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Verificar si el nombre de grupo está disponible */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Disponibilidad devuelta */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            isUnique: boolean;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/user/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener los grupos de estudio de un usuario */
        get: {
            parameters: {
                query?: {
                    role?: string;
                };
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Grupos devueltos con éxito */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Group"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener detalles de un grupo por ID */
        get: {
            parameters: {
                query?: {
                    userId?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Detalles del grupo */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Group"];
                    };
                };
                /** @description Grupo no encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener solicitudes pendientes de ingreso a un grupo */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de solicitudes */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown[];
                    };
                };
            };
        };
        put?: never;
        /** Enviar solicitud de unión al grupo */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["JoinGroupRequest"];
                };
            };
            responses: {
                /** @description Solicitud enviada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/requests/{requestId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Aceptar o rechazar una solicitud de ingreso */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    requestId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["HandleJoinRequest"];
                };
            };
            responses: {
                /** @description Acción procesada con éxito */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/requests/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Eliminar solicitud de unión de un usuario */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Solicitud eliminada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agregar miembro directamente a un grupo */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AddMemberRequest"];
                };
            };
            responses: {
                /** @description Miembro agregado exitosamente */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/members/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Eliminar un miembro de un grupo */
        delete: {
            parameters: {
                query: {
                    adminId: string;
                };
                header?: never;
                path: {
                    id: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Miembro eliminado con éxito */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/leave/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Salir voluntariamente de un grupo de estudio */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Salida exitosa */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/transfer-admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Ceder administración de forma directa */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TransferAdminRequest"];
                };
            };
            responses: {
                /** @description Administración cedida */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/transfer-admin/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Solicitar transferencia de administración a un miembro */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RequestAdminTransfer"];
                };
            };
            responses: {
                /** @description Solicitud de transferencia enviada exitosamente */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{id}/transfer-admin/response": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Aceptar o rechazar solicitud de transferencia de administración */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AdminTransferResponse"];
                };
            };
            responses: {
                /** @description Respuesta procesada */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/groups/{groupId}/available-students": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener estudiantes disponibles para agregar al grupo */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    groupId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Estudiantes disponibles recuperados */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown[];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener lista de eventos universitarios */
        get: {
            parameters: {
                query?: {
                    category?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de eventos */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Event"][];
                    };
                };
            };
        };
        put?: never;
        /** Crear un nuevo evento universitario */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateEventRequest"];
                };
            };
            responses: {
                /** @description Evento creado */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Event"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener todas las categorías de eventos */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Categorías devueltas */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Category"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/suscribir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Suscribirse a una categoría de eventos */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SubscribeCategoryRequest"];
                };
            };
            responses: {
                /** @description Suscripción exitosa */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Suscripción duplicada */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** Cancelar suscripción a una categoría */
        delete: {
            parameters: {
                query: {
                    userId: string;
                    categoryId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Cancelación exitosa */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/suscripciones/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener las categorías suscritas de un estudiante */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de suscripciones */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown[];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ErrorResponse: {
            /** @example Ocurrió un error genérico */
            error: string;
        };
        Error400: {
            /** @example Solicitud incorrecta o parámetros inválidos */
            error: string;
        };
        Error401: {
            /** @example No autorizado - Token inválido o ausente */
            error: string;
        };
        Error404: {
            /** @example Recurso no encontrado */
            error: string;
        };
        Error500: {
            /** @example Ocurrió un error en el servidor interno */
            error: string;
        };
        SuccessResponse: {
            /** @example true */
            success: boolean;
        };
        Pagination: {
            /** @example 1 */
            page: number;
            /** @example 20 */
            limit: number;
            /** @example 150 */
            totalCount: number;
            /** @example 8 */
            totalPages: number;
            /** @example true */
            hasNextPage: boolean;
            /** @example false */
            hasPrevPage: boolean;
        };
        User: {
            uid: string;
            name: string;
            /** Format: email */
            email: string;
            lastLogin?: string;
            biography?: string;
            showEmail?: boolean;
            phone?: string;
            age?: number | string;
            studyPreference?: string;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        RegisterRequest: {
            /** Format: email */
            email: string;
            password: string;
            displayName: string;
            career?: string;
            semester?: number;
        };
        AuthResponse: {
            user: {
                uid: string;
                name: string;
                /** Format: email */
                email: string;
                lastLogin?: string;
                biography?: string;
                showEmail?: boolean;
                phone?: string;
                age?: number | string;
                studyPreference?: string;
            };
            token: string;
        };
        LogoutResponse: {
            message: string;
        };
        UserProfile: {
            uid: string;
            name: string;
            /** Format: email */
            email: string;
            /** Format: uri */
            photoURL?: string;
            lastLogin?: string;
            biography?: string;
            showEmail?: boolean;
            phone?: string;
            age?: number | string;
            studyPreference?: string;
            interests?: string[];
            careerId?: string;
            careerName?: string;
            facultyId?: string;
            facultyName?: string;
            academicLevelId?: string;
            academicLevelName?: string;
            formationLevelId?: string;
            formationLevelName?: string;
            subjects?: string[];
            subjectNames?: string[];
            mappingId?: string;
            estadisticas?: {
                /** @default 0 */
                gruposCreados: number;
                /** @default 0 */
                gruposParticipa: number;
                /** @default 0 */
                mensajesEnviados: number;
            };
            insignias?: string[];
        };
        AcademicProfile: {
            studentId: string;
            mappingId?: string;
            subjects?: string[];
            updatedAt?: string;
        };
        Estadisticas: {
            /** @default 0 */
            gruposCreados: number;
            /** @default 0 */
            gruposParticipa: number;
            /** @default 0 */
            mensajesEnviados: number;
        };
        UpsertProfileRequest: {
            uid?: string;
            name?: string;
            /** Format: email */
            email?: string;
            biography?: string;
            phone?: string;
            showEmail?: boolean;
            age?: number | string;
            studyPreference?: string;
            interests?: string[];
            careerId?: string;
            careerName?: string;
            facultyId?: string;
            facultyName?: string;
            academicLevelId?: string;
            academicLevelName?: string;
            formationLevelId?: string;
            formationLevelName?: string;
            subjects?: string[];
            subjectNames?: string[];
            mappingId?: string;
        };
        SearchStudentsResponse: {
            users: {
                uid: string;
                name: string;
                /** Format: email */
                email: string;
                /** Format: uri */
                photoURL?: string;
                lastLogin?: string;
                biography?: string;
                showEmail?: boolean;
                phone?: string;
                age?: number | string;
                studyPreference?: string;
                interests?: string[];
                careerId?: string;
                careerName?: string;
                facultyId?: string;
                facultyName?: string;
                academicLevelId?: string;
                academicLevelName?: string;
                formationLevelId?: string;
                formationLevelName?: string;
                subjects?: string[];
                subjectNames?: string[];
                mappingId?: string;
                estadisticas?: {
                    /** @default 0 */
                    gruposCreados: number;
                    /** @default 0 */
                    gruposParticipa: number;
                    /** @default 0 */
                    mensajesEnviados: number;
                };
                insignias?: string[];
            }[];
            total: number;
            page: number;
            limit: number;
        };
        Message: {
            id: string;
            chatId: string;
            senderId: string;
            content: string;
            /** @enum {string} */
            type: "text" | "image" | "file" | "system";
            fileURL?: string | null;
            fileName?: string | null;
            fileSize?: number | null;
            createdAt: string;
            readBy?: string[];
            reactions?: {
                [key: string]: string[];
            };
        };
        SendMessageRequest: {
            content: string;
            /**
             * @default text
             * @enum {string}
             */
            type: "text" | "image" | "file" | "system";
            fileURL?: string | null;
            fileName?: string | null;
            fileSize?: number | null;
        };
        CreateChatRequest: {
            participants: string[];
        };
        CreateChatResponse: {
            success: boolean;
            chat: {
                id: string;
                participants: string[];
                lastMessage?: string;
                updatedAt: string;
            };
        };
        AddReactionRequest: {
            reaction: string;
        };
        Chat: {
            id: string;
            participants: string[];
            lastMessage?: string;
            updatedAt: string;
        };
        ChatSuccessResponse: {
            success: boolean;
        };
        Faculty: {
            id: string;
            name: string;
            description?: string;
        };
        Career: {
            id: string;
            name: string;
            facultyId: string;
            description?: string;
        };
        Subject: {
            id: string;
            name: string;
            sectionId?: string;
            credits?: number;
            code?: string;
        };
        AcademicLevel: {
            id: string;
            name: string;
        };
        FormationLevel: {
            id: string;
            name: string;
        };
        Notification: {
            userId: string;
            title: string;
            body: string;
            /** @default {} */
            metadata: {
                [key: string]: unknown;
            };
            type: string;
            /** @default GENERAL */
            eventType: string;
            action?: {
                label: string;
                endpoint: string;
                token?: string | null;
            };
            createdAt?: string;
        };
        NotifyRequest: {
            /** @enum {string} */
            event: "SOLICITUD_INGRESO" | "SOLICITUD_ACEPTADA" | "SOLICITUD_RECHAZADA" | "TRANSFER_ADMIN" | "TRANSFER_ADMIN_SOLICITADA" | "TRANSFER_ADMIN_ACEPTADA" | "TRANSFER_ADMIN_RECHAZADA" | "MENCION" | "NUEVO_EVENTO";
            payload: {
                [key: string]: unknown;
            };
        };
        Group: {
            id: string;
            name: string;
            description?: string;
            subjectId?: string;
            subjectName?: string;
            isPrivate: boolean;
            maxMembers: number;
            adminId: string;
            membersCount: number;
            createdAt?: string;
        };
        Event: {
            id: string;
            title: string;
            description: string;
            date: string;
            location: string;
            organizerId: string;
            categoryId: string;
            createdAt?: string;
        };
        Category: {
            id: string;
            name: string;
            description?: string;
        };
        CreateGroupRequest: {
            name: string;
            description?: string;
            subjectId?: string;
            subjectName?: string;
            /** @default false */
            isPrivate: boolean;
            /** @default 50 */
            maxMembers: number;
            adminId: string;
            rules?: string;
        };
        JoinGroupRequest: {
            userId: string;
            userName: string;
            message?: string;
        };
        HandleJoinRequest: {
            /** @enum {string} */
            status: "ACEPTADA" | "RECHAZADA";
        };
        TransferAdminRequest: {
            adminId: string;
            newAdminId: string;
        };
        AdminTransferResponse: {
            /** @enum {string} */
            status: "ACEPTADA" | "RECHAZADA";
        };
        CreateEventRequest: {
            title: string;
            description: string;
            date: string;
            location: string;
            organizerId: string;
            categoryId: string;
        };
        SubscribeCategoryRequest: {
            userId: string;
            categoryId: string;
        };
        RequestAdminTransfer: {
            adminId: string;
            candidateId: string;
        };
        AddMemberRequest: {
            userId: string;
            userName: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
