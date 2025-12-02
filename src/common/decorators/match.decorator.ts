import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Types } from "mongoose";

@ValidatorConstraint({ name: 'match_between_field', async: false })

export class MongoDBIds implements ValidatorConstraintInterface {

    validate(ids: Types.ObjectId[], args: ValidationArguments) {


      
        for (const id of ids) {
            if (!Types.ObjectId.isValid(id)) {
                return false;
            }
        }
        return true




    };

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `Invalid mongoDBId format `

    }
}
export class MatchBetweenFields<T = any> implements ValidatorConstraintInterface {
    validate(value: T, args: ValidationArguments) {

      
        return value === args.object[args.constraints[0]];

    };

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `fail to match src field :: ${validationArguments?.property} with target :: ${validationArguments?.constraints[0]} `

    }
}

export function IsMatch<T = any>(constraints: string[], validationOptions?: ValidationOptions) {
    //object from SignupBodyDto
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor, // SignupBodyDto
            propertyName: propertyName,  // confirm password لان هي دي الي عليها الديكورتور
            options: validationOptions,
            constraints, //(pass , email) or  any things i want match between it 
            validator: MatchBetweenFields<T>,
        });
    };
}
