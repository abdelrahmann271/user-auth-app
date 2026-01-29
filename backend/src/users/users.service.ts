import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, name, password } = createUserDto;
    const normalizedEmail = email.toLowerCase();

    try {
      const existingUser = await this.userModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        this.logger.warn(`Duplicate signup attempt: ${normalizedEmail}`);
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      const newUser = new this.userModel({
        email: normalizedEmail,
        name,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      this.logger.log(`User created: ${savedUser.email}`);
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email: email.toLowerCase() });
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error(`Password validation failed: ${error.message}`, error.stack);
      return false;
    }
  }

  async incrementTokenVersion(userId: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { tokenVersion: 1 } },
        { new: true },
      );
      
      if (user) {
        this.logger.log(`Token invalidated for: ${user.email}`);
      } else {
        this.logger.warn(`Token invalidation failed: user ${userId} not found`);
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Failed to increment token version: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to invalidate token');
    }
  }
}
