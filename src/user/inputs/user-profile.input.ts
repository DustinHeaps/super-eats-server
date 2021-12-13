import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { User } from '../entities/user.entity';

@InputType()
export class UserProfileInput {
  @Field(() => Number)
  userId: number
}

@ObjectType()
export class UserProfileResponse extends SharedResponse {
  @Field(() => User, { nullable: true })
  user?: User;

}