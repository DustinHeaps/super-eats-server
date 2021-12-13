import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { PaginationInput, PaginationResponse } from 'src/shared/inputs/paginationInput';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsResponse extends PaginationResponse {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}