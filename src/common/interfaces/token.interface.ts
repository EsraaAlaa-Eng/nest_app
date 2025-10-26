import { JwtPayload } from "jsonwebtoken";
import { UserDocument } from "src/DB";
import type { Request } from "express";

export interface ICredentials {
    user: UserDocument,
    decoded: JwtPayload
}
export interface IAuthRequest extends Request {
    credentials: ICredentials;
}