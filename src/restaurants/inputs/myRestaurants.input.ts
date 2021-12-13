import { ObjectType, Field } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class MyRestaurantsResponse extends SharedResponse {
  @Field(() => [Restaurant])
  restaurants?: Restaurant[];
}