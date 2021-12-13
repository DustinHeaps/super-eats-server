import { ObjectType, Field, Int, ArgsType, InputType } from '@nestjs/graphql';
import { SharedResponse } from './shared.input';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationResponse extends SharedResponse{
  @Field({ nullable: true })
  totalPages?: number;

  @Field(() => Int, { nullable: true })
  totalResults?: number;
}
