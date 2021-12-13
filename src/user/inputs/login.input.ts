import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { User } from '../entities/user.entity';

@InputType()
  export class LoginInput extends PickType(User, ['email', 'password']) {
}


@ObjectType()
export class LoginResponse extends SharedResponse{
  @Field(() => String, {nullable: true})
  token?: string
}
