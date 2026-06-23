import {
    Body,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import {
    AssignIssueDto,
    CreateIssueDto,
    IssueFiltersQueryDto,
    IssueQueryDto,
    MoveIssueDto,
    UpdateIssueDto,
} from '../../dtos';
import { IssueFacade } from '../../issue.facade';

import {
    AssignIssueSwagger,
    CreateIssueSwagger,
    DeleteIssueSwagger,
    GetAllIssuesSwagger,
    GetOneIssueSwagger,
    MoveIssueSwagger,
    RestoreIssueSwagger,
    UpdateIssueSwagger,
} from './swagger';

@ApiBaseController('issues', 'Issues', true)
export class IssuesController {
    constructor(private readonly facade: IssueFacade) {}

    @Post()
    @CreateIssueSwagger()
    create(@Body() dto: CreateIssueDto, @Query() q: IssueQueryDto, @GetUserId() userId: string) {
        return this.facade.create(dto, q.slug, q.key, userId);
    }

    @Get(':id')
    @GetOneIssueSwagger()
    getById(@Query() q: IssueQueryDto, @Param('id') id: string, @GetUserId() userId: string) {
        return this.facade.getOne(id, q.slug, userId);
    }

    @Get()
    @GetAllIssuesSwagger()
    getAll(@Query() query: IssueFiltersQueryDto, @GetUserId() userId: string) {
        return this.facade.getAll(query, userId);
    }

    @Patch(':id')
    @UpdateIssueSwagger()
    update(
        @Param('id') id: string,
        @Query() q: IssueQueryDto,
        @Body() dto: UpdateIssueDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.update(id, q.slug, q.key, dto, userId);
    }

    @Post(':id/move')
    @MoveIssueSwagger()
    @HttpCode(HttpStatus.OK)
    move(
        @Param('id') id: string,
        @Query() q: IssueQueryDto,
        @Body() dto: MoveIssueDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.move(id, q.slug, q.key, dto, userId);
    }

    @Put(':id/assignee')
    @AssignIssueSwagger()
    assign(
        @Param('id') id: string,
        @Query() q: IssueQueryDto,
        @Body() dto: AssignIssueDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.assign(id, q.slug, dto, userId);
    }

    @Post(':id/restore')
    @RestoreIssueSwagger()
    restore(@Param('id') id: string, @Query() q: IssueQueryDto, @GetUserId() userId: string) {
        return this.facade.restore(id, q.slug, userId);
    }

    @Delete(':id')
    @DeleteIssueSwagger()
    delete(@Param('id') id: string, @Query() q: IssueQueryDto, @GetUserId() userId: string) {
        return this.facade.delete(id, q.slug, userId);
    }
}
