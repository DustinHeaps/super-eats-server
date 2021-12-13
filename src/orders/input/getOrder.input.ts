
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';

import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderResponse extends SharedResponse {
  @Field(() => Order, { nullable: true })
  order?: Order;
}