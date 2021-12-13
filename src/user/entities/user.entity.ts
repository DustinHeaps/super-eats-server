import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { SharedEntity } from 'src/shared/entities/shared.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { InternalServerErrorException } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Driver = 'Driver'
}

registerEnumType(UserRole, {name: 'UserRole'})

@InputType('UserInputType', {isAbstract: true})
@ObjectType()
@Entity()
export class User extends SharedEntity {
  @Field(type => String)
  @Column({unique: true})
  @IsEmail()
  email: string;

  @Field(() => String)
  @Column({select: false})
  @IsString()
  password: string;
  
  @Field(() => UserRole)
  @Column({type: 'enum', enum: UserRole})
  @IsEnum(UserRole)
  role: UserRole;

  @Field(() => Boolean)
  @Column({default: false})
  @IsBoolean()
  verified: boolean

  @OneToMany(() => Restaurant, restaurant => restaurant.owner)
  @Field(() => [Restaurant])
  restaurants: Restaurant[]

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
  
  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  @Field(() => [Payment])
  @OneToMany(() => Payment, (payment) => payment.user, { eager: true })
  payments: Payment[];
  
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
   try {
    this.password = await bcrypt.hash(this.password, 10)
   } catch (e) {
     console.log(e)
     throw new InternalServerErrorException()
   }
  }

  }

  async checkPassword(inputtedPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(inputtedPassword, this.password);
      return ok;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

