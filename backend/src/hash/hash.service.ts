import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  compare(password: string, userPassword: string) {
    return bcrypt.compare(password, userPassword);
  }

  getHash(password: string) {
    return bcrypt.hash(password, 10);
  }
}
