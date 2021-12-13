import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SharedResponse {
@Field(() => String, { nullable: true })
message?: string;

@Field(() => Boolean)
success: boolean;
}