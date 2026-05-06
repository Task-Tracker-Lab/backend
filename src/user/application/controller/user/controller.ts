import { Body, Get, Patch, Query } from '@nestjs/common';
import { GetMeActivitySwagger, GetMeSwagger, PatchMeSwagger } from './swagger';
import { UpdateProfileDto } from '../../dtos';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { UserFacade } from '../../user.facade';
import { PaginationDto } from '@shared/dtos';

@ApiBaseController('users/me', 'Account Profile', true)
export class UserController {
    constructor(private readonly facade: UserFacade) {}

    @Get()
    @GetMeSwagger()
    async getProfile(@GetUserId() id: string) {
        return this.facade.getProfile(id);
    }

    @Patch()
    @PatchMeSwagger()
    async updateProfile(@Body() dto: UpdateProfileDto, @GetUserId() id: string) {
        return this.facade.updateProfile(id, dto);
    }

    @Get('activity')
    @GetMeActivitySwagger()
    async getActivity(@Query() query: PaginationDto, @GetUserId() id: string) {
        return this.facade.getActivity(id, query.page, query.limit);
    }
}
