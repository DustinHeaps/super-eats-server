import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { SharedResponse } from 'src/shared/inputs/shared.input';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}



@ObjectType()
export class VerifyEmailResponse extends SharedResponse {}