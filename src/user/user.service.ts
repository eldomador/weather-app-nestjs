import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from './user.entity';
import { Model } from 'mongoose';
import { UserResponseType } from './types/userResponse.type';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userModel.findOne({ email: createUserDto.email });

    if (user) {
      throw new HttpException(
        'Email is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async loginUser(loginDto: LoginDto): Promise<UserEntity> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(loginDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Incorrect password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return user;
  }

  buildUserResponse(userEntity: UserEntity): UserResponseType {
    return {
      username: userEntity.username,
      email: userEntity.email,
      favorites: userEntity.favorites,
      token: this.generateJwt(userEntity),
    };
  }

  generateJwt(userEntity: UserEntity): string {
    return sign({ email: userEntity.email }, 'JWT_SECRET');
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userModel.findOne({ email });
  }

  async getFavorites(user: UserEntity): Promise<string[]> {
    return user.favorites;
  }

  async addFavorite(user: UserEntity, location: string): Promise<UserEntity> {
    if (!user.favorites.includes(location)) {
      user.favorites.push(location);
      await this.userModel.updateOne(
        { email: user.email },
        { favorites: user.favorites },
      );
      return this.userModel.findOne({ email: user.email }).exec();
    } else {
      throw new HttpException(
        'Location already in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeFavorite(
    user: UserEntity,
    location: string,
  ): Promise<UserEntity> {
    if (user.favorites.includes(location)) {
      user.favorites = user.favorites.filter((fav) => fav !== location);
      await this.userModel.updateOne(
        { email: user.email },
        { $set: { favorites: user.favorites } },
      );
      return this.userModel.findOne({ email: user.email }).exec();
    } else {
      throw new HttpException(
        'Location not found in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
