import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWishlistsDto } from './dto/create-wishlists.dto';
import { UpdateWishlistsDto } from './dto/update-wishlists.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { validate } from 'class-validator';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistsDto,
    user: User,
    wishes: Wish[],
  ) {
    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
    const errors = await validate(wishlist);
    if (errors.length > 0) {
      const messages = errors.map((error) => error.constraints);
      throw new BadRequestException(messages);
    }
    return await this.wishlistRepository.save(wishlist);
  }

  async update(
    id: string,
    updateWishlistsDto: UpdateWishlistsDto,
    wishes?: Wish[],
  ) {
    let updWishlist: Wishlist;
    try {
      updWishlist = await this.wishlistRepository.findOne({
        relations: {
          items: true,
        },
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '22P02') {
          throw new BadRequestException('Wishlist с таким id не найден!');
        }
      }
    }
    const updatedWishlist = {
      id: updWishlist.id,
      name: updateWishlistsDto.name
        ? updateWishlistsDto.name
        : updWishlist.name,
      image: updateWishlistsDto.image
        ? updateWishlistsDto.image
        : updWishlist.image,
      items: wishes ? wishes : updWishlist.items,
    };
    const wishlist = this.wishlistRepository.create(updatedWishlist);
    const errors = await validate(wishlist);
    if (errors.length > 0) {
      const messages = errors.map((error) => error.constraints);
      throw new BadRequestException(messages);
    }
    return await this.wishlistRepository.save(wishlist);
  }

  async removeOne(id: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
        items: true,
      },
    });
    return await this.wishlistRepository.remove(wishlist);
  }

  async findAll() {
    return await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findOne(id: string) {
    try {
      return await this.wishlistRepository.findOne({
        where: { id },
        relations: { owner: true, items: true },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '22P02') {
          throw new BadRequestException('Wishlist с таким id не найден!');
        }
      }
    }
  }

  async checkOwner(wishlistId: string, userId: string) {
    let wishlist: Wishlist;
    try {
      wishlist = await this.wishlistRepository.findOne({
        where: { id: wishlistId },
        select: { id: true },
        relations: { owner: true },
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '22P02') {
          throw new BadRequestException('Wishlist с таким id не найден!');
        }
      }
    }
    return wishlist.owner.id === userId;
  }
}
