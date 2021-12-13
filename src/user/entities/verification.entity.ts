import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import { SharedEntity } from '../../shared/entities/shared.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Verification extends SharedEntity {
  @Column()
  @Field(() => String)
  code: string

  @OneToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn()
  user: User

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }

}