import { ArgsType, Field, InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { User } from '../entities/user.entity';

@InputType()
export class EditProfileInput extends PartialType(PickType(User, ["email", 'password'])) {

}

@ObjectType()
export class EditProfileResponse extends SharedResponse {
 

}