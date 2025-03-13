
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/config/error';
import responseBody from '@/config/response';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json(responseBody(false, err.message));
    }

    console.error(`Unexpected error: ${err.message}`);
    res.status(500).json(responseBody(false, 'Server Unexpected error'));
};

export default errorHandler;