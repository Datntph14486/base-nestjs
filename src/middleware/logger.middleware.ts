import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `\x1b[35m[Request Method:]\x1b[0m ` + // Màu tím cho timestamp
        `\x1b[34mMethod:\x1b[0m \x1b[32m${req.method}\x1b[0m | ` + // Xanh dương cho label, xanh lá cho method
        `\x1b[33mURL:\x1b[0m \x1b[36m${req.url}\x1b[0m`, // Vàng cho label, cyan cho URL
    );
    next();
  }
}
