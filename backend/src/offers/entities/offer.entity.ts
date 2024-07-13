import { Column, Entity, ManyToOne } from 'typeorm';
import { IsBoolean, IsNumber } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.wishes)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;

  @Column({ type: 'numeric' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Значение должно быть округлено до сотых' },
  )
  amount: number;

  @Column({
    default: false,
  })
  @IsBoolean({ message: 'Должно быть указано булевое значение' })
  hidden: boolean;
}
