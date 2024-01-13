import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseType } from './types/userResponse.type';
import { LoginDto } from './dto/login.dto';
import { ExpressRequest } from './middlewares/auth.middleware';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseType> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('user/login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<UserResponseType> {
    const user = await this.userService.loginUser(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  async currentUser(
    @Request() request: ExpressRequest,
  ): Promise<UserResponseType> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.buildUserResponse(request.user);
  }

  @Get('user/favorites')
  @ApiResponse({ status: 200, description: 'Get user favorites successfully' })
  async getFavorites(@Request() request: ExpressRequest): Promise<string[]> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.userService.getFavorites(request.user);
  }

  @Post('user/add-favorite')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          example: 'London',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Favorite location added successfully',
  })
  async addFavorite(
    @Request() request: ExpressRequest,
    @Body('location') location: string,
  ): Promise<UserResponseType> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const updatedUser = await this.userService.addFavorite(
      request.user,
      location,
    );
    return this.userService.buildUserResponse(updatedUser);
  }

  @Delete('user/remove-favorite')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          example: 'London',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite location removed successfully',
  })
  async removeFavorite(
    @Request() request: ExpressRequest,
    @Body('location') location: string,
  ): Promise<UserResponseType> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const updatedUser = await this.userService.removeFavorite(
      request.user,
      location,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
