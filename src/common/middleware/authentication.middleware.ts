
import { BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';


export const PreAuth =  (req: Request, res: Response, next: NextFunction) => {

  if (!(req.headers.authorization?.split(" ")?.length == 2)) {
    throw new BadRequestException("missing authorization Key")
  }

  next();
}


