import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/config/error';
import responseBody from '@/config/response';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof CustomError) {
        res.status(err.statusCode).json(responseBody(false, err.message));

        return;
    }

    res.status(500).json(responseBody(false, 'Server Unexpected error'));
}

export default errorHandler;
