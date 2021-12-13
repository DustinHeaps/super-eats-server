import { InputType, PickType, Field, ObjectType, Int } from '@nestjs/graphql';
import { truncate } from 'fs/promises';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'image',
  'address',
]) {
  @Field(() => String)
  categoryName: string;
}
@ObjectType()
export class CreateRestaurantResponse extends SharedResponse {
  @Field(() => Int)
  restaurantId?: number;
}