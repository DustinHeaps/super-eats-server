import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/user/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput, CreatePaymentResponse } from './inputs/createPayment.input';
import { GetPaymentsResponse } from './inputs/getPayment.input';
import { PaymentService } from './payments.service';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CreatePaymentResponse)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentResponse> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

    @Query(() => GetPaymentsResponse)
    @Role(['Owner'])
    getPayments(@AuthUser() user: User): Promise<GetPaymentsResponse> {
      return this.paymentService.getPayments(user);
    }

  }