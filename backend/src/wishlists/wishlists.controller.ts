import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';

import { WishlistsService } from './wishlists.service';
import { CreateWishlistsDto } from './dto/create-wishlists.dto';
import { UpdateWishlistsDto } from './dto/update-wishlists.dto';
import { User } from '../users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';
import { Wish } from '../wishes/entities/wish.entity';
import { JwtGuard } from '../auth/guards/jwt-auth-guards';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(
    private readonly wishlistsService: WishlistsService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }
  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createWishlistsDto: CreateWishlistsDto,
    @Req() req: Request & { user: User },
  ) {
    const wishList = await this.wishesService.findManyById(
      createWishlistsDto.itemsId,
    );
    return this.wishlistsService.create(createWishlistsDto, req.user, wishList);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistsService.findOne(id);
  }
  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishlistsDto: UpdateWishlistsDto,
    @Req() req: Request & { user: User },
  ) {
    const isOwner = await this.wishlistsService.checkOwner(id, req.user.id);
    if (!isOwner) {
      throw new ForbiddenException(
        'Разрешается изменять только свои wishlists',
      );
    }
    let wishList: Wish[];
    if (updateWishlistsDto.itemsId && updateWishlistsDto.itemsId.length > 0) {
      wishList = await this.wishesService.findManyById(
        updateWishlistsDto.itemsId,
      );
    }
    return this.wishlistsService.update(id, updateWishlistsDto, wishList);
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  async removeOne(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    const isOwner = await this.wishlistsService.checkOwner(id, req.user.id);
    if (!isOwner) {
      throw new ForbiddenException('Удалить можно только свой wishlist');
    }
    return this.wishlistsService.removeOne(id);
  }
}
