import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';

@Injectable()
export class DeleteBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(id: string, _boardId: string, _userId: string): Promise<boolean> {
        return this.boardsRepo.removeView(id);
    }
}
