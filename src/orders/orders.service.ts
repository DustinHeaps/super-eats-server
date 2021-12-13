import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from 'src/shared/constants/shared.constants';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import {
  CreateOrderInput,
  CreateOrderResponse,
} from './input/createOrder.input';
import { EditOrderInput, EditOrderResponse } from './input/editOrder.input';
import { GetOrderInput, GetOrderResponse } from './input/getOrder.input';
import { GetOrdersInput, GetOrdersResponse } from './input/getOrders.input';
import { TakeOrderInput, TakeOrderResponse } from './input/takeOrder.input';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderResponse> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          success: false,
          message: 'Restaurant not found',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            success: false,
            message: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }

        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );

        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
// console.log(customer)
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders:  {order, ownerId: restaurant.ownerId, customer}
      });

      return {
        success: true,
        orderId: order.id,
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: 'Could not create order',
      };
    }
  }
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersResponse> {
    try {
      let orders: Order[];

      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Driver) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat();

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        success: true,
        orders,
      };
    } catch {
      return {
        success: false,
        message: 'Could not get orders',
      };
    }
  }
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderResponse> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
        };
      }

      // if (!this.canSeeOrder(user, order)) {
      //   return {
      //     success: false,
      //     message: "You can't see that",
      //   };
      // }

      return {
        success: true,
        order,
      };
    } catch {
      return {
        success: false,
        message: 'Could not find order',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;

    if (user.role === 'Client' && order.customerId !== user.id) {
      canSee = false;
    }

    if (user.role === 'Driver' && order.driverId !== user.id) {
      canSee = false;
    }

    if (user.role === 'Owner' && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }
  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderResponse> {
    try {
      const order = await this.orders.findOne(orderId);

      if (!order) {
        return {
          success: false,
          message: 'Order not found',
        };
      }

      // if (!this.canSeeOrder(user, order)) {
      //   return {
      //     success: false,
      //     message: "You can't see that",
      //   };
      // }

      let canEdit = true;

      if (user.role === 'Client') {
        canEdit = false;
      }

      if (user.role === 'Owner') {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }

      if (user.role === 'Driver') {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }

      if (!canEdit) {
        return {
          success: false,
          message: "You can't do that",
        };
      }

      await this.orders.save({
        id: orderId,
        status,
      });

      const newOrder = { ...order, status };

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }

      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: "You can't edit order",
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderResponse> {
    try {

      const order = await this.orders.findOne(orderId);
      // console.log(order)
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
        };
      }

      if (order.driver) {
  
        return {
          success: false,
          message: 'This order already has a driver',
        };
      }

    const takenOrder = await this.orders.save({
        id: orderId,
        driver,
      });
      console.log(driver)
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: 'Could not update an order',
      };
    }
  }


}
