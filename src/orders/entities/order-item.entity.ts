import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { SharedEntity } from 'src/shared/entities/shared.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends SharedEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, { nullable: true })
  dish?: Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
