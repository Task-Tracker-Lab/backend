import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId, SkipContract } from '@shared/decorators';
import { ProjectFacade } from '../../project.facade';
import { AddProjectMemberDto, UpdateProjectMemberDto } from '../../dtos';
import {
    AddMemberSwagger,
    FindAllMembersSwagger,
    FindAvailableUsersSwagger,
    RemoveMemberSwagger,
    UpdateMemberSwagger,
} from './swagger';

@ApiBaseController('projects/:slug/members', 'Project Members', true)
export class ProjectMembersController {
    constructor(private readonly facade: ProjectFacade) {}

    @Get()
    @FindAllMembersSwagger()
    async findAll(@Param('slug') slug: string, @GetUserId() userId: string) {
        return this.facade.getMembers(slug, userId);
    }

    @Post()
    @AddMemberSwagger()
    async addMember(
        @Param('slug') slug: string,
        @GetUserId() userId: string,
        @Body() dto: AddProjectMemberDto,
    ) {
        return this.facade.addMember(slug, userId, dto);
    }

    @Put(':memberId')
    @UpdateMemberSwagger()
    async updateMember(
        @Param('slug') slug: string,
        @Param('memberId') memberId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateProjectMemberDto,
    ) {
        return this.facade.updateMemberRole(slug, memberId, userId, dto);
    }

    @Delete(':memberId')
    @RemoveMemberSwagger()
    async removeMember(
        @Param('slug') slug: string,
        @Param('memberId') memberId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.removeMember(slug, memberId, userId);
    }

    @Get('available')
    @SkipContract()
    @FindAvailableUsersSwagger()
    async getAvailableUsers(
        @Param('slug') slug: string,
        @GetUserId() userId: string,
        @Query('search') search?: string,
    ) {
        return this.facade.getAvailableTeamMembers(slug, userId, search);
    }
}
