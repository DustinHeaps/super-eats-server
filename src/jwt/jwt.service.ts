import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/shared/constants/shared.constants';
import { JwtModuleOptions } from './jwt.interfaces';
// import { CLIENTS } from './jwt.module';

@Injectable()
export class JwtService {
  constructor(
    // @Inject(CLIENTS) private readonly options: JwtModuleOptions
  ) {
    // console.log(this.config.get('privateKey'));
    
  }

  sign(userId: number): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET);
  }

  verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
