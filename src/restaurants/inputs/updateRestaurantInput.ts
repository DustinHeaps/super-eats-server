import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';

import { SharedResponse } from 'src/shared/inputs/shared.input';
import { CreateRestaurantInput } from './createRestaurantInput';

// The PartialType() returns a type with all the properties of the input type set to optional
@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field()
  restaurantId: number
}

@ObjectType()
export class UpdateRestaurantResponse extends SharedResponse {
}