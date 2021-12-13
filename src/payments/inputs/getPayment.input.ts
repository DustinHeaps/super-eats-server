import { ObjectType, Field } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Payment } from '../entities/payment.entity';

@ObjectType()
export class GetPaymentsResponse extends SharedResponse {
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];
}