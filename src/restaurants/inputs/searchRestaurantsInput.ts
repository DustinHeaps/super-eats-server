import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationResponse } from 'src/shared/inputs/paginationInput';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(() => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantResponse extends PaginationResponse {
  @Field((type) => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}