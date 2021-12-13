import { Patch } from '@nestjs/common';
import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { PaginationInput, PaginationResponse } from 'src/shared/inputs/paginationInput';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Category } from '../entities/category.entity';


@InputType()
export class CategoryInput extends PaginationInput{
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryResponse extends PaginationResponse {
  @Field(() => Category, {nullable: true})
  category?: Category
}