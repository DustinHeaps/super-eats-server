import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersResponse extends SharedResponse {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}