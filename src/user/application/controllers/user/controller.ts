import { Body, Get, Patch, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { CursorQuery } from '@shared/schemas';

import { UpdateProfileDto } from '../../dtos';
import { UserFacade } from '../../user.facade';

import { GetMeActivitySwagger, GetMeSwagger, PatchMeSwagger } from './swagger';

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
    async getActivity(@Query() query: CursorQuery, @GetUserId() id: string) {
        return this.facade.getActivity(id, query);
    }
}
