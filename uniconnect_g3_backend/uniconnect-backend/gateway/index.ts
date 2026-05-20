import * as dotenv from 'dotenv';
import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage } from 'http';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        process.env.DASHBOARD_URL || 'http://localhost:8081',
        "http://localhost:5173", // Vite web app
        "https://corrine-hirudinoid-ayleen.ngrok-free.dev" // ngrok for mobile app
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

const onProxyRes = (proxyRes: IncomingMessage) => {
    // Only delete CORS headers from the proxied service response
    // Gateway's cors() middleware will handle CORS properly
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-headers'];
};

import * as fs from 'fs';
import * as path from 'path';

// --- CENTRAL SWAGGER UI DOCUMENTATION ---
app.use('/docs', swaggerUi.serve as any, (req: Request, res: Response, next: express.NextFunction) => {
    // Read the file dynamically so it hot-reloads without restarting
    const openApiPath = path.resolve(__dirname, './openapi.json');
    try {
        const document = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
        (swaggerUi.setup(document) as any)(req, res, next);
    } catch (e) {
        res.status(500).send('OpenAPI document not found or invalid');
    }
});

// --- AUTH SERVICE ---
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// --- USER / PROFILE / SEARCH SERVICE ---
app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// Legacy routes for backward compatibility
app.use('/api/academic-profile', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/profile`,
    changeOrigin: true,
    pathRewrite: { '^/api/academic-profile': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/search-students', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/search`,
    changeOrigin: true,
    pathRewrite: { '^/api/search-students': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

// --- SOCIAL SERVICE (Groups & Events) ---
app.use('/api/events', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/events`,
    changeOrigin: true,
    pathRewrite: { '^/api/events': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/groups', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/groups`,
    changeOrigin: true,
    pathRewrite: { '^/api/groups': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// --- CHAT SERVICE ---
app.use('/api/chats', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/chats': '' },
    ws: true,
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// Legacy route for backward compatibility
app.use('/api/chat', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '' },
    ws: true,
    on: {
        proxyRes: onProxyRes
    }
}));

// --- GROUP CHAT SERVICE ---
app.use('/api/group-chats', createProxyMiddleware({
    target: `${process.env.CHAT_SERVICE_URL}/groups`,
    changeOrigin: true,
    pathRewrite: { '^/api/group-chats': '' },
    ws: true,
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/socket.io', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    ws: true
}));

// --- ACADEMIC SERVICE ---
app.use('/api/academic/careers', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers`,
    changeOrigin: true,
    pathRewrite: { '^/api/academic/careers': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/academic/faculties', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/faculties`,
    changeOrigin: true,
    pathRewrite: { '^/api/academic/faculties': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/academic/subjects', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/subjects`,
    changeOrigin: true,
    pathRewrite: { '^/api/academic/subjects': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// Legacy routes for backward compatibility
app.use('/api/careers', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers`,
    changeOrigin: true,
    pathRewrite: { '^/api/careers': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/career-structure', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/career-structure`,
    changeOrigin: true,
    pathRewrite: { '^/api/career-structure': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/subjects', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/subjects`,
    changeOrigin: true,
    pathRewrite: { '^/api/subjects': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/hierarchy/faculties', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/faculties`,
    changeOrigin: true,
    pathRewrite: { '^/api/hierarchy/faculties': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/hierarchy/academic-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/academic-levels`,
    changeOrigin: true,
    pathRewrite: { '^/api/hierarchy/academic-levels': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/hierarchy/formation-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/formation-levels`,
    changeOrigin: true,
    pathRewrite: { '^/api/hierarchy/formation-levels': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

app.use('/api/hierarchy/careers-by-path', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers-by-path`,
    changeOrigin: true,
    pathRewrite: { '^/api/hierarchy/careers-by-path': '' },
    on: {
        proxyRes: onProxyRes
    }
}));

// --- NOTIFICATION SERVICE ---
app.use('/api/notifications', createProxyMiddleware({
    target: `${process.env.NOTIFICATION_SERVICE_URL}/notifications`,
    changeOrigin: true,
    pathRewrite: { '^/api/notifications': '' },
    timeout: 10000,
    on: {
        proxyRes: onProxyRes
    }
}));

// Health Check (Cleaned up duplicates)
app.get('/status', (_req: Request, res: Response) => {
    res.json({ 
        status: 'Gateway Operativo', 
        entorno: process.env.NODE_ENV || 'Desarrollo',
        timestamp: new Date() 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway UniConnect corriendo en puerto ${PORT}`);
    console.log(`🔗 Exponiendo servicios a través de ngrok en el puerto ${PORT}`);
    console.log(`📖 Documentación de API disponible en http://localhost:${PORT}/docs`);
});
