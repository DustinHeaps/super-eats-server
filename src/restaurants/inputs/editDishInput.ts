import { InputType, PickType, PartialType, Field, Int, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class EditDishResponse extends SharedResponse {}