import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class MyRestaurantResponse extends SharedResponse {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}