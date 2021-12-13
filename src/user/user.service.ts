import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from 'src/user/entities/verification.entity';
import { Repository } from 'typeorm';
import { JwtService } from '../jwt/jwt.service';
import { User } from './entities/user.entity';
import { LoginInput, LoginResponse } from './inputs/login.input';
import { RegisterInput, RegisterResponse } from './inputs/register.input';
import * as bcrypt from 'bcrypt';
import { UserProfileResponse } from './inputs/user-profile.input';
import {
  EditProfileInput,
  EditProfileResponse,
} from './inputs/edit-profile.input';
import { Mutation } from '@nestjs/graphql';
import {
  VerifyEmailInput,
  VerifyEmailResponse,
} from './inputs/verify-email.input';
import { truncate } from 'fs';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from 'src/jwt/jwt.interfaces';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    // private readonly config: ConfigService,
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async registerUser({
    email,
    password,
    role,
  }: RegisterInput): Promise<RegisterResponse> {
    try {
      const exists = await this.users.findOne({ email: email });
      if (exists) {
        return {
          success: false,
          message: 'This email is already being used',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      // const verification = await this.verification.save(this.verification.create({user}));
      const verification = await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      this.emailService.sendVerificationEmail(user.email, verification.code);
 
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: "Couldn't create the account",
      };
    }
  }
  async loginUser({ email, password }: LoginInput): Promise<LoginResponse> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          success: false,
          message: "That email doesn't exist",
        };
      }
      const valid = await user.checkPassword(password);
      if (!valid) {
        return {
          success: false,
          message: 'Incorrect password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return { success: true, token };
    } catch (e) {
      return {
        success: false,
        message: "Can't log user in",
      };
    }
  }
  async findById(id: number): Promise<UserProfileResponse> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return { user, success: true };
    } catch (e) {
      return {
        message: 'User not found',
        success: false,
      };
    }
  }
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileResponse> {
    try {
      const user = await this.users.findOne({ id: userId });
      console.log(user)
      if (email) {
        console.log(email)
        user.email = email;
        user.verified = false;
        await this.verification.delete({ user: { id: user.id } });

        const verification = await this.verification.save(
          this.verification.create({user}),
        );
        this.emailService.sendVerificationEmail(
          user.email,
          verification.code,
        );
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Profile failed to update' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailResponse> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { success: true };
      }
      return { success: false, message: 'Verification not found' };
    } catch (error) {
      return { success: false, message: "Could'nt verify email" };
    }
  }
}
