import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer-dto';
import { validate } from 'class-validator';
import { User } from '../users/entities/user.entity';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User, wish: Wish) {
    const offer = this.offersRepository.create({
      user: user,
      amount: createOfferDto.amount,
      hidden: createOfferDto.hidden,
      item: wish,
    });
    const errors = await validate(offer);
    if (errors.length > 0) {
      const messages = errors.map((error) => error.constraints);
      throw new BadRequestException(messages);
    }
    const isOwner = await this.wishesService.checkOwner(
      createOfferDto.itemId,
      user.id,
    );
    if (isOwner) {
      throw new ForbiddenException(
        'Запрещено скидываться на собственные подарки',
      );
    }
    await this.wishesService.checkRaised(
      createOfferDto.itemId,
      createOfferDto.amount,
    );
    await this.wishesService.checkPrice(
      createOfferDto.itemId,
      createOfferDto.amount,
    );
    await this.offersRepository.save(offer);
  }

  async findOne(id: string) {
    try {
      return await this.offersRepository.findOne({
        where: { id, hidden: false },
        relations: { user: true, item: true },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '22P02') {
          throw new BadRequestException('Offer с таким id не найден!');
        }
      }
    }
  }

  async findAll() {
    return await this.offersRepository.find({
      where: {
        hidden: false,
      },
      relations: {
        item: true,
        user: true,
      },
    });
  }
}
