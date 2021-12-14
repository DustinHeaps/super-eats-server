import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GqlContextType, GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import * as Joi from 'joi';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { string } from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { Verification } from './user/entities/verification.entity';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
// import { JwtModule } from './jwt/jwt.module';
import { JwtService } from './jwt/jwt.service';
import { SharedModule } from './shared/shared.module';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USER: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),

      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      synchronize: true,
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      // cors: {
      //   origin: 'http://localhost:5000/graphql',
      //   credentials: true,
      // },

      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: async ({ req, connection }) => {
        if (req) {
          return { headers: req.headers };
        } else {
          return { headers: connection.context };
        }
      },
    }),
    RestaurantsModule,
    UserModule,
    SharedModule,
    AuthModule,
    EmailModule.forRoot({
      apiKey: process.env.MAILGUN_APIKEY,
      fromEmail: process.env.MAILGUN_DOMAIN_NAME,
      domain: process.env.MAILGUN_FROM_EMAIL,
    }),
    OrdersModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
