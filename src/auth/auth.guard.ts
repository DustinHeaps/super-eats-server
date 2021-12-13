import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler())
    const ctx = GqlExecutionContext.create(context).getContext();
 
 
    if(!roles) return true
    
    if(!ctx.req){
      if (!ctx.headers.Authorization) return false
      ctx.user = await this.validateToken(ctx.headers.Authorization);
    } else {
      if (!ctx.headers.authorization) return false
      ctx.user = await this.validateToken(ctx.headers.authorization);
    }

    if (roles.includes('Any')) return true;

    return roles.includes(ctx.user.role)
  }

  async validateToken(auth: string) {

    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({id: decoded.id})

      return user;

    } catch (err) {
      const message = 'Token error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}