import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

import { UploadMediaDto } from '../dtos';

export const UploadMediaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Загрузить медиа-файл',
            description:
                'Загружает файл в S3 и инициирует фоновую задачу по обновлению ссылки в БД.',
        }),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            description: 'Файл для загрузки и метаданные',
            type: UploadMediaDto.Output,
        }),
        ApiResponse({
            status: 201,
            description: 'Файл успешно загружен и принят в обработку',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Неверный формат файла или отсутствуют обязательные поля'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
