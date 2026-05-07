import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';

export function setupLogger(service: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    return WinstonModule.createLogger({
        level: isProduction ? 'info' : 'debug',
        transports: [
            new transports.Console({
                format: format.combine(
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    format.ms(),
                    format.errors({ stack: true }),
                    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] }),
                    format((info) => {
                        if (!isProduction) {
                            // @ts-expect-error : Will resolved
                            const rid = info.metadata?.requestId;
                            info.message = rid ? `[${rid}] ${info.message}` : info.message;
                        }
                        return info;
                    })(),

                    isProduction
                        ? format.json()
                        : utilities.format.nestLike(service, {
                              colors: true,
                              prettyPrint: false,
                          }),
                ),
            }),
        ],
    });
}
