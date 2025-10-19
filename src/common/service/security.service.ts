import { Injectable } from "@nestjs/common";
import { compareHash, generateHash } from "../utils/security/hash.security";

@Injectable()
export class SecurityService{
    static compareHash() {
        throw new Error("Method not implemented.");
    }
    
    constructor(){}

    generateHash=generateHash;
    compareHash=compareHash

}