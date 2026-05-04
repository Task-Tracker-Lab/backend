import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import { ApiForbidden, ApiNotFound, ApiUnauthorized } from '@shared/error';
import { SyncTagsDto } from '../../dtos';

export const SyncTeamTagsSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Синхронизировать теги команды' }),
        ApiBody({ type: SyncTagsDto.Output }),
        ApiResponse({ status: 200, description: 'Теги обновлены', type: ActionResponse.Output }),
        ApiForbidden(),
        ApiNotFound(),
        ApiUnauthorized(),
    );
