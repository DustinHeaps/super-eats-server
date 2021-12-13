import { InputType, PickType, Field, Int, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'photo',
  'description',
  'options',

]) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishResponse extends SharedResponse {}