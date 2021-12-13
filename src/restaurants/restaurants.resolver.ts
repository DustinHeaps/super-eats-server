import {
  Args,
  ArgsType,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  CreateRestaurantResponse,
  CreateRestaurantInput,
} from './inputs/createRestaurantInput';
import { Restaurant } from './entities/restaurant.entity';
import {
  UpdateRestaurantInput,
  UpdateRestaurantResponse,
} from './inputs/updateRestaurantInput';
import { RestaurantsService } from './restaurants.service';
import { SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User, UserRole } from 'src/user/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  DeleteRestaurantInput,
  DeleteRestaurantResponse,
} from './inputs/deleteRestaurantInput';
import { Category } from './entities/category.entity';
import { CategoriesResponse } from './inputs/categoriesInput';
import { CategoryInput, CategoryResponse } from './inputs/categoryInput';
import { RestaurantsInput, RestaurantsResponse } from './inputs/restaurantsInput';
import { RestaurantInput, RestaurantResponse } from './inputs/restaurantInput';
import { SearchRestaurantInput, SearchRestaurantResponse } from './inputs/searchRestaurantsInput';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishResponse } from './inputs/createDishInput';
import { EditDishInput, EditDishResponse } from './inputs/editDishInput';
import { DeleteDishInput, DeleteDishResponse } from './inputs/deleteDishInput';
import { MyRestaurantResponse, MyRestaurantInput } from './inputs/myRestaurant.input';
import { MyRestaurantsResponse } from './inputs/myRestaurants.input';

@Resolver(Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateRestaurantResponse)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() user: User,
    @Args('input') input: CreateRestaurantInput,
  ): Promise<CreateRestaurantResponse> {
    return this.restaurantService.createRestaraunt(user, input);
  }
  @Query(() => MyRestaurantsResponse)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsResponse> {
    return this.restaurantService.myRestaurants(owner);
  }

  @Query(() => MyRestaurantResponse)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: MyRestaurantInput,
  ): Promise<MyRestaurantResponse> {
    return this.restaurantService.myRestaurant(owner, input);
  }

  @Mutation(() => UpdateRestaurantResponse)
  @Role(['Owner'])
  async updateRestaurant(
    @AuthUser() user: User,
    @Args('input') input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantResponse> {
    return this.restaurantService.updateRestaurant(user, input);
  }

  @Mutation(() => UpdateRestaurantResponse)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() user: User,
    @Args('input') input: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantResponse> {
    return this.restaurantService.deleteRestaurant(user, input);
  }
  
  @Query(() => SearchRestaurantResponse) 
  searchRestaurants(
    @Args('input') input: SearchRestaurantInput,
  ): Promise<SearchRestaurantResponse> {
    return this.restaurantService.searchRestaurantsByName(input);
  }
} 

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<Number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => CategoriesResponse)
  allCategories(): Promise<CategoriesResponse> {
    return this.restaurantService.getAllCategories();
  }

  @Query(() => CategoryResponse)
  category(@Args('input') input: CategoryInput): Promise<CategoryResponse> {
    return this.restaurantService.getCategory(input);
  }
  @Query(() => RestaurantsResponse)
  allRestaurants(@Args('input') input: RestaurantsInput): Promise<RestaurantsResponse> {
    return this.restaurantService.getAllRestaurants(input);
  }
  @Query(() => RestaurantResponse)
  restaurant(@Args('input') input: RestaurantInput): Promise<RestaurantResponse> {
    return this.restaurantService.getRestaurant(input);
  }


}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateDishResponse)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') input: CreateDishInput,
  ): Promise<CreateDishResponse> {
    return this.restaurantService.createDish(owner, input);
  }

  @Mutation((type) => EditDishResponse)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') input: EditDishInput,
  ): Promise<EditDishResponse> {
    return this.restaurantService.editDish(owner, input);
  }

  @Mutation((type) => DeleteDishResponse)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') input: DeleteDishInput,
  ): Promise<EditDishResponse> {
    return this.restaurantService.deleteDish(owner, input);
  }
}
