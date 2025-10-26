import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/DB";

@Injectable()
export class UserService {

    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async Profile(data: any): Promise<string> {
     
        console.log(data);
        return `Done`
    }




}