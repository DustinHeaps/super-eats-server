import { InputType, PickType, Field, ObjectType, Int } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Int)
  restaurantId?: number;
}

@ObjectType()
export class DeleteRestaurantResponse extends SharedResponse {

}