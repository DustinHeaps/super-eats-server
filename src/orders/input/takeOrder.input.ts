import { InputType, PickType, ObjectType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Order } from '../entities/order.entity';

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class TakeOrderResponse extends SharedResponse {}