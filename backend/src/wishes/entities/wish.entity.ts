import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { ColumnNumericTransformer } from '../../utils/utils';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Wish extends BaseEntity {
  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @Column()
  @IsString()
  @Length(1, 250, {
    message: 'Длинна строки должна составлять от 2 до 200 символов',
  })
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column({ type: 'numeric', transformer: new ColumnNumericTransformer() })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Значение price должно быть округлено до сотых' },
  )
  price: number;

  @Column({
    type: 'numeric',
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Значение raised должно быть округлено до сотых' },
  )
  raised: number;

  @Column()
  @IsString()
  @Length(1, 1024, {
    message: 'Длинна строки должна составлять от 1 до 1024 символов',
  })
  description: string;

  @Column({ default: null })
  @IsOptional()
  @IsInt()
  copied: number;

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
