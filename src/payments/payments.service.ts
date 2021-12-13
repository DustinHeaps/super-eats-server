import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/user/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput, CreatePaymentResponse } from './inputs/createPayment.input';
import { GetPaymentsResponse } from './inputs/getPayment.input';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentResponse> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          success: false,
          message: 'Restaurant not found',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          success: false,
          message: "You can't do this",
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;

      this.restaurants.save(restaurant);

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: 'Could not create payment',
      };
    }
  }
  async getPayments(user: User): Promise<GetPaymentsResponse> {
    try {
      const payments = await this.payments.find({ user: user });
      return {
        success: true,
        payments,
      };
    } catch {
      return {
        success: false,
        message: 'Could not load paymenst',
      };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}