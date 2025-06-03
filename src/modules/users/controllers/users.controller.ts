import { Controller, Get, Post, Body, Param, Put, Delete, Logger, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { successResponse } from 'src/common/response/response.interface';
import { GetListUsersDto } from '../dtos/get-list-users.dto';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async create(@Query() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return successResponse(user);
  }

  @Get()
  async findAll(@Query() getListUsersDto: GetListUsersDto) {
    const users = await this.usersService.findAll(getListUsersDto);
    return successResponse(users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return successResponse(user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<UserEntity>) {
    const user = await this.usersService.update(id, updateData);
    return successResponse(user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    return successResponse(user);
  }
}
