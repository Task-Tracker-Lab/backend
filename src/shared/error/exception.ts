import { HttpException, type HttpStatus } from '@nestjs/common';

interface IDetailsOptions {
    readonly target?: string;
    readonly [key: string]: any;
}

export interface IErrorOptions {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly IDetailsOptions[];
}

export class BaseException extends HttpException {
    constructor(options: IErrorOptions, status: HttpStatus) {
        super(options, status);
    }
}
