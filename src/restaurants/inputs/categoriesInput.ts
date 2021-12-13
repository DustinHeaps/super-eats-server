import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Category } from '../entities/category.entity';

@ObjectType()
export class CategoriesResponse extends SharedResponse {
  @Field(() => [Category], {nullable: true})
  categories?: Category[]
}