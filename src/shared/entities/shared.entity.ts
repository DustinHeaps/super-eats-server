import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export class SharedEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date; 
}