import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { UserCreateInput } from 'generated/prisma/models';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });
    return user;
  }

  async create(data: UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }
}
