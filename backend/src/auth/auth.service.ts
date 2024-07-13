import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
  async validatePassword(username: string, password: string) {
    let user: User;
    try {
      user = await this.usersService.findByUsername(username, true);
    } catch (error) {
      throw new UnauthorizedException('Неверный логин/пароль');
    }
    const isMatched = await this.hashService.compare(password, user.password);
    if (!isMatched) {
      throw new UnauthorizedException('Неверный логин/пароль');
    }
    return user;
  }
}
