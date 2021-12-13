import { ArgsType, Field, InputType, ObjectType, OmitType, PickType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { User } from '../entities/user.entity';



// The PickType() function constructs a new type (class) by picking a set of properties from an input type
@InputType()
export class RegisterInput extends PickType(User, ['email', 'password', 'role']) {
}



@ObjectType()
export class RegisterResponse extends SharedResponse {


}