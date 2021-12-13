import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';

@InputType()
export class DeleteDishInput {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class DeleteDishResponse extends SharedResponse {}