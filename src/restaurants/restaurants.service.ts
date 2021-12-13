import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/user/entities/user.entity';
import { Verification } from 'src/user/entities/verification.entity';
import { Like, Raw, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoriesResponse } from './inputs/categoriesInput';
import { CategoryInput, CategoryResponse } from './inputs/categoryInput';
import { CreateDishInput, CreateDishResponse } from './inputs/createDishInput';
import {
  CreateRestaurantResponse,
  CreateRestaurantInput,
} from './inputs/createRestaurantInput';
import { DeleteDishInput, DeleteDishResponse } from './inputs/deleteDishInput';
import {
  DeleteRestaurantInput,
  DeleteRestaurantResponse,
} from './inputs/deleteRestaurantInput';
import { EditDishInput, EditDishResponse } from './inputs/editDishInput';
import {
  MyRestaurantInput,
  MyRestaurantResponse,
} from './inputs/myRestaurant.input';
import { MyRestaurantsResponse } from './inputs/myRestaurants.input';
import { RestaurantInput, RestaurantResponse } from './inputs/restaurantInput';
import {
  RestaurantsInput,
  RestaurantsResponse,
} from './inputs/restaurantsInput';
import {
  SearchRestaurantInput,
  SearchRestaurantResponse,
} from './inputs/searchRestaurantsInput';
import {
  UpdateRestaurantResponse,
  UpdateRestaurantInput,
} from './inputs/updateRestaurantInput';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver } from './restaurants.resolver';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}

  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const slug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({ slug });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug, name: categoryName }),
      );
    }
    return category;
  }

  async createRestaraunt(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantResponse> {
    try {
      const newRestaurant = this.restaurants.create(input);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(input.categoryName);
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);

      return { success: true, restaurantId: newRestaurant.id };
    } catch (e) {
      return {
        success: false,
        message: 'Could not create restaurant'
      };
    }
  }

  async updateRestaurant(
    owner: User,
    input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantResponse> {
    try {
      const restaurant = await this.restaurants.findOne(input.restaurantId, {
        loadRelationIds: true,
      });
      if (!restaurant) {
        return { success: false, message: 'Restaurant not found' };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          success: false,
          message: 'Only the restaurant owner can edit this restaurant',
        };
      }
      let category: Category;
      if (input.categoryName) {
        category = await this.categories.getOrCreate(input.categoryName);
      }
      await this.restaurants.save([
        {
          id: input.restaurantId,
          name: input.name,
          ...(category && { category }),
        },
      ]);

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: 'Restaurant update failed',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    input: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantResponse> {
    try {
      const restaurant = await this.restaurants.findOne(input.restaurantId);
      if (!restaurant) {
        return { success: false, message: 'Restaurant not found' };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          success: false,
          message: 'Only the restaurant owner can delete this restaurant',
        };
      }
      //  await this.restaurants.delete(input.restaurantId)

      return { success: true };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: 'Restaurant delete failed',
      };
    }
  }

  async getAllCategories(): Promise<CategoriesResponse> {
    try {
      const categories = await this.categories.find();
      return {
        success: true,
        categories,
      };
    } catch (message) {
      return {
        success: false,
        message: 'Load categories failed',
      };
    }
  }
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async getCategory(input: CategoryInput): Promise<CategoryResponse> {
    try {
      const category = await this.categories.findOne({ slug: input.slug });

      if (!category) {
        return {
          success: false,
          message: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        take: 25,
        skip: (input.page - 1) * 25,
        where: { category },
        order: {
          isPromoted: 'DESC'
        }
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);

      return {
        success: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (e) {
      return {
        success: true,
        message: 'Load category failed',
      };
    }
  }

  async getAllRestaurants(
    input: RestaurantsInput,
  ): Promise<RestaurantsResponse> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (input.page - 1) * 3,
        take: 3,
        order: {
          isPromoted: 'DESC'
        }
      });

      return {
        success: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        success: false,
        message: 'Load restaurants failed',
      };
    }
  }
  async getRestaurant(input: RestaurantInput): Promise<RestaurantResponse> {
    try {
      const restaurant = await this.restaurants.findOne(input.restaurantId, {
        relations: ['menu'],
        
      });

      if (!restaurant) {
        return {
          success: false,
          message: 'Restaurant not found',
        };
      }

      return {
        success: true,
        restaurant,
      };
    } catch {
      return {
        success: false,
        message: 'Load restaurant failed',
      };
    }
  }

  async searchRestaurantsByName(
    input: SearchRestaurantInput,
  ): Promise<SearchRestaurantResponse> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${input.query}%'`),
        },
      });

      return {
        success: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        success: false,
        message: 'Search for restaurants failed',
      };
    }
  }

  async createDish(
    owner: User,
    input: CreateDishInput,
  ): Promise<CreateDishResponse> {
    try {
      const restaurant = await this.restaurants.findOne(input.restaurantId);

      if (!restaurant) {
        return {
          success: false,
          message: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          success: false,
          message: "You can't do that",
        };
      }

      await this.dishes.save(this.dishes.create({ ...input, restaurant }));

      return {
        success: true,
      };
    } catch (message) {
      return {
        success: false,
        message: 'Could not create the dish',
      };
    }
  }
  async editDish(owner: User, input: EditDishInput): Promise<EditDishResponse> {
    try {
      const dish = await this.dishes.findOne(input.dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          success: false,
          message: 'Dish not found',
        };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          success: false,
          message: "You can't do that",
        };
      }

      await this.dishes.save([
        {
          id: input.dishId,
          ...input,
        },
      ]);
      return {
        success: true,
      };
    } catch (message) {
      return {
        success: false,
        message: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishResponse> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          success: false,
          message: 'Dish not found',
        };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          success: false,
          message: "You can't do that",
        };
      }

      await this.dishes.delete(dishId);

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: 'Could not delete dish',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsResponse> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        success: true,
      };
    } catch {
      return {
        success: false,
        message: 'Could not find restaurants',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantResponse> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        success: true,
        restaurant,
      };
    } catch {
      return {
        success: false,
        message: 'Could not find restaurants',
      };
    }
  }
}
