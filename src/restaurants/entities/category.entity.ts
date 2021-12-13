import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { SharedEntity } from 'src/shared/entities/shared.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', {isAbstract: true})
@ObjectType()
@Entity()
export class Category extends SharedEntity {
  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column({nullable: true})
  @IsString()
  image?: string

  @Field(type => String)
  @Column({unique: true})
  @IsString()
  slug: string

  @OneToMany(() => Restaurant, restaurant => restaurant.category)
  @Field(() => [Restaurant])
  restaurants: Restaurant[]
}
