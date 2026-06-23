import { Injectable } from '@nestjs/common';

import {
    AssignIssueDto,
    CreateIssueDto,
    IssueQueryDto,
    MoveIssueDto,
    UpdateIssueDto,
} from './dtos';
import {
    AssignIssueUseCase,
    CreateIssueUseCase,
    DeleteIssueUseCase,
    FindAllIssueQuery,
    FindOneIssueQuery,
    MoveIssueUseCase,
    RestoreIssueUseCase,
    UpdateIssueUseCase,
} from './use-cases';

@Injectable()
export class IssueFacade {
    constructor(
        private readonly createIssueUC: CreateIssueUseCase,
        private readonly updateIssueUC: UpdateIssueUseCase,
        private readonly deleteIssueUC: DeleteIssueUseCase,
        private readonly assignIssueUC: AssignIssueUseCase,
        private readonly getOneIssueQ: FindOneIssueQuery,
        private readonly getAllIssueQ: FindAllIssueQuery,
        private readonly moveIssueUC: MoveIssueUseCase,
        private readonly restoreIssueUC: RestoreIssueUseCase,
    ) {}

    public create = async (dto: CreateIssueDto, slug: string, key: string, userId: string) =>
        this.createIssueUC.execute(dto, slug, key, userId);

    public getOne = async (id: string, slug: string, userId: string) =>
        this.getOneIssueQ.execute(id, slug, userId);

    public getAll = async (query: IssueQueryDto, userId: string) =>
        this.getAllIssueQ.execute(query, userId);

    public update = async (
        id: string,
        slug: string,
        key: string,
        dto: UpdateIssueDto,
        userId: string,
    ) => this.updateIssueUC.execute(id, slug, key, dto, userId);

    public move = async (
        id: string,
        slug: string,
        key: string,
        dto: MoveIssueDto,
        userId: string,
    ) => this.moveIssueUC.execute(id, slug, key, dto, userId);

    public assign = async (id: string, slug: string, dto: AssignIssueDto, userId: string) =>
        this.assignIssueUC.execute(id, slug, dto, userId);

    public delete = async (id: string, slug: string, userId: string) =>
        this.deleteIssueUC.execute(id, slug, userId);

    public restore = async (id: string, slug: string, userId: string) =>
        this.restoreIssueUC.execute(id, slug, userId);
}
