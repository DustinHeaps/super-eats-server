import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { PaginationInput, PaginationResponse } from 'src/shared/inputs/paginationInput';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantInput {
  @Field()
  restaurantId?: number
}

@ObjectType()
export class RestaurantResponse extends SharedResponse {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant
}