import {
  Mutation,
  Args,
  Resolver,
  Query,
  Subscription,
  Context,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/user/entities/user.entity';
import { Order } from './entities/order.entity';
import {
  CreateOrderInput,
  CreateOrderResponse,
} from './input/createOrder.input';
import { EditOrderInput, EditOrderResponse } from './input/editOrder.input';
import { GetOrderResponse, GetOrderInput } from './input/getOrder.input';
import { GetOrdersInput, GetOrdersResponse } from './input/getOrders.input';
import { OrderService } from './orders.service';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from '../shared/constants/shared.constants';
import { Inject } from '@nestjs/common';
import { UpdateOrderInput } from './input/updateOrder.input';
import { TakeOrderInput, TakeOrderResponse } from './input/takeOrder.input';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderResponse)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<CreateOrderResponse> {
    return this.ordersService.createOrder(customer, input);
  }

  @Query(() => GetOrdersResponse)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') input: GetOrdersInput,
  ): Promise<GetOrdersResponse> {
    return this.ordersService.getOrders(user, input);
  }

  @Query(() => GetOrderResponse)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') input: GetOrderInput,
  ): Promise<GetOrderResponse> {
    return this.ordersService.getOrder(user, input);
  }

  @Mutation(() => EditOrderResponse)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') input: EditOrderInput,
  ): Promise<EditOrderResponse> {
    return this.ordersService.editOrder(user, input);
  }

  @Mutation(() => Boolean)
  potatoReady() {
    this.pubSub.publish('hot-potatoes', {
      readyPotatoe: 'ypur pit os ready',
    });
    return true;
  }

  @Subscription(() => Order, {
    filter: (payload, _, ctx) => {
      return (
        payload.pendingOrders.ownerId === payload.pendingOrders.customer.id
      );
    },
    resolve: ({ pendingOrders: { order } }) => {
      return order;
    },
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @Role(['Driver'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: UpdateOrderInput },
      { user }: { user: User },
    ) => {
      console.log(
        order.driverId,
        order.customerId,
        order.restaurant.ownerId,
        user.id,
      );

      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }

      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') input: UpdateOrderInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(() => TakeOrderResponse)
  @Role(['Driver'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') input: TakeOrderInput,
  ): Promise<TakeOrderResponse> {
    return this.ordersService.takeOrder(driver, input);
  }
}
