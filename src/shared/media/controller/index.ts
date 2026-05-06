import { Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { UploadMediaDto } from '../dtos';
import { MediaService } from '../media.service';
import { UploadMediaSwagger } from './swagger';
import { ExtractMediaReq } from '../decorators';

@ApiBaseController('upload', 'Upload Media', true)
export class MediaController {
    constructor(private readonly service: MediaService) {}

    @Post()
    @UploadMediaSwagger()
    async upload(@ExtractMediaReq() dto: UploadMediaDto, @GetUserId() userId: string) {
        return this.service.upload(dto, userId);
    }
}
