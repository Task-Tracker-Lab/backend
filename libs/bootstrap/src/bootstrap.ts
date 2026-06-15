import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DEFAULT_THROTTLER_OPTIONS } from './configs/throttler';
import { setupCors, setupLogger, setupThrottler, setupSwagger } from './setups';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import type { BootstrapOptions } from './interfaces/options.interface';
import fastifyCookie from '@fastify/cookie';
import fastifyCompress from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import fastifyCsrf from '@fastify/csrf-protection';
import { createId } from '@paralleldrive/cuid2';
import type { IncomingMessage } from 'http';

export async function bootstrapApp(options: BootstrapOptions) {
    const startTime = performance.now();
    const adapter = new FastifyAdapter({
        requestIdHeader: 'x-request-id',
        requestIdLogLabel: 'request',
        genReqId: (req: IncomingMessage) => {
            return (req.headers['x-request-id'] as string) || createId();
        },
    });

    const {
        appModule,
        apiPrefix,
        version = 'v1',
        serviceName = 'App',
        portEnvKey = 'PORT',
        defaultPort = 3000,
        setupApp,
        useCookieParser = true,
        useCors = true,
        throttlerOptions = DEFAULT_THROTTLER_OPTIONS,
        swaggerOptions,
    } = options;

    let rootModule = appModule;

    if (throttlerOptions) {
        rootModule = setupThrottler(rootModule, throttlerOptions);
    }

    const app = await NestFactory.create<NestFastifyApplication>(rootModule, adapter, {
        rawBody: true,
        bufferLogs: false,
    });

    const logger = new Logger(serviceName?.[0]?.toUpperCase() + serviceName.slice(1));
    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>(portEnvKey, defaultPort);
    const origins = configService.getOrThrow('CORS_ALLOWED_ORIGINS');

    app.enableShutdownHooks();

    app.getHttpAdapter()
        .getInstance()
        .addHook('onSend', async (request, reply, payload) => {
            reply.header('x-request-id', request.id);
            return payload;
        })
        /**
         * НАЗНАЧЕНИЕ: Полифил совместимости Fastify с экосистемой Passport.js (Express-way).
         * * ПОЧЕМУ ТУТ ТИП 'any':
         * Объекты 'request' и 'reply' принадлежат типам 'FastifyRequest' и 'FastifyReply'.
         * Библиотека 'passport' жестко ожидает архитектуру Express (в частности, наличие методов
         * res.setHeader(), res.end() и прямой ссылки req.res).
         * * Расширение интерфейсов Fastify через декларацию модулей (Module Augmentation) в данном
         * контексте избыточно, так как мы мутируем объекты исключительно локально внутри инфраструктурного
         * хука для Node.js HTTP-слоя (this.raw). Приведение к 'any' здесь является легитимным решением
         * для динамического monkey-patching-а.
         */
        .addHook('onRequest', (request: any, reply: any, done) => {
            reply.setHeader = function (key: string, value: string) {
                return this.raw.setHeader(key, value);
            };
            reply.end = function () {
                this.raw.end();
            };
            request.res = reply;
            done();
        });

    await setupLogger(app, options.serviceName);

    await app.register(fastifyCompress, {
        global: true,
        threshold: 1024,
    });

    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 5 * 1024 * 1024,
            fieldNameSize: 100,
            files: 5,
        },
    });

    if (apiPrefix) app.setGlobalPrefix(apiPrefix);
    if (version) {
        const hasV = version.startsWith('v');

        app.enableVersioning({
            type: VersioningType.URI,
            prefix: hasV ? 'v' : '',
            defaultVersion: hasV ? version.slice(1) : version,
        });
    }
    if (useCors) setupCors(app, origins);
    if (swaggerOptions) {
        const { path = 'docs', ...metadata } = swaggerOptions;

        const domain = configService.get('DOMAIN');
        const stage = configService.get('STAGE_DOMAIN');

        const fullOptions = {
            ...metadata,
            path,
            server: {
                port,
                domain,
                stage,
            },
        };

        await setupSwagger(app, fullOptions);
    }
    if (useCookieParser) {
        const secret = configService.getOrThrow('COOKIE_SECRET');
        await app.register(fastifyCookie, { secret });
        await app.register(fastifyCsrf, {
            cookieOpts: {
                signed: true,
                httpOnly: true,
                sameSite: 'strict',
                secure: configService.getOrThrow('NODE_ENV') === 'production',
            },
        });
    }
    if (setupApp) setupApp(app);

    await app.listen(port, '0.0.0.0', (_err, address) => {
        const prefix = [apiPrefix, version].filter(Boolean).join('/');
        const baseUrl = `${address}${prefix ? '/' + prefix : ''}`;

        const swaggerBase = `${address}${apiPrefix ? '/' + apiPrefix : ''}`;
        const swaggerPath = swaggerOptions?.path ?? 'docs';

        if (_err) {
            logger.error(_err);
            process.exit(1);
        }

        const startupTime = (performance.now() - startTime).toFixed(2);
        logger.verbose(`Environment:     ${process.env['NODE_ENV'] || 'development'}`);
        logger.verbose(`API Endpoint:    ${baseUrl}`);
        logger.verbose(`Health Check:    ${baseUrl}/health`);
        logger.verbose(`Swagger UI:      ${swaggerBase}/${swaggerPath}`);
        logger.verbose(`OpenAPI (Specs): ${swaggerBase}/${swaggerPath}/s/{json,yaml}`);
        logger.verbose(`Boot Time:       ${startupTime}ms`);
    });
}
