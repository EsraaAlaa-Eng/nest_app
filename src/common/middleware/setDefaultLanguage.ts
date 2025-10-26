import type { Response, Request, NextFunction } from "express";

export const setDefaultLanguage = (req: Request, res: Response, next: NextFunction) => {

    req.headers['accept-language'] = req.headers['accept-language'] ?? 'EN'

    console.log('setDefaultLanguage middleware triggered with:', req.headers['accept-language']);

    next()
}