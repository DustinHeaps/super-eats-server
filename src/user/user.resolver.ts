
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {  RegisterResponse, RegisterInput } from './inputs/register.input';
import { LoginInput, LoginResponse } from './inputs/login.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserProfileInput, UserProfileResponse } from './inputs/user-profile.input';
import { EditProfileInput, EditProfileResponse } from './inputs/edit-profile.input';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserService } from './user.service';
import { VerifyEmailInput, VerifyEmailResponse } from './inputs/verify-email.input';
import { Role } from 'src/auth/role.decorator';


@Resolver(User)

export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => RegisterResponse)
  async register(@Args('input') input: RegisterInput): Promise<RegisterResponse> {
      return this.userService.registerUser(input);
    }
  

  @Mutation(() => LoginResponse) 
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.userService.loginUser(input);
  }

  @Query(() => User)
  @Role(['Any'])
  me(@Context('user') user: User) {
    return user;
  }

  @Query(() => UserProfileResponse)
  @Role(['Any'])
  async userProfile(@Args('input') input: UserProfileInput): Promise<UserProfileResponse> {
    return this.userService.findById(input.userId)
  }
  @Mutation(() => EditProfileResponse)
  @Role(['Any'])
  async editProfile(@AuthUser() user: User, @Args('input') input: EditProfileInput): Promise<EditProfileResponse> {
    return this.userService.editProfile(user.id, input)
  }

  @Mutation(() => VerifyEmailResponse)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput): Promise<VerifyEmailResponse>  {
    return this.userService.verifyEmail(code)
  }
}
